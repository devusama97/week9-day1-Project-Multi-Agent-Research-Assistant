import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResearchDocument } from '../schemas/document.schema';
import { ResearchTrace } from '../schemas/trace.schema';
import { StateGraph, END, Annotation } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { v4 as uuidv4 } from 'uuid';
import * as natural from 'natural';
import { PDFParse } from 'pdf-parse';
import { Observable } from 'rxjs';

// Define the Annotation (State) for LangGraph
const ResearchStateAnnotation = Annotation.Root({
    question: Annotation<string>,
    subQuestions: Annotation<string[]>,
    rawDocuments: Annotation<any[]>,
    rankedDocuments: Annotation<any[]>,
    summaries: Annotation<string[]>,
    contradictions: Annotation<string[]>,
    finalAnswer: Annotation<string>,
    trace: Annotation<any[]>({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
    startTime: Annotation<number>,
});

type ResearchState = typeof ResearchStateAnnotation.State;

@Injectable()
export class ResearchService {
    private readonly logger = new Logger(ResearchService.name);
    private model: ChatOpenAI;

    constructor(
        @InjectModel(ResearchDocument.name) private docModel: Model<ResearchDocument>,
        @InjectModel(ResearchTrace.name) private traceModel: Model<ResearchTrace>,
    ) {
        this.model = new ChatOpenAI({
            apiKey: process.env.OPENROUTER_API_KEY,
            model: process.env.OPENROUTER_MODEL || 'google/gemini-3-flash-preview',
            maxTokens: 1000, // Limit tokens to avoid credit errors on OpenRouter
            configuration: {
                baseURL: 'https://openrouter.ai/api/v1',
            },
        });
    }

    // --- Nodes ---

    async splitterNode(state: ResearchState) {
        const response = await this.model.invoke([
            { role: 'system', content: 'You are a Question Splitter. Break the user question into 2-3 specific sub-questions for document retrieval. Return them as a semicolon-separated list. Only return the list.' },
            { role: 'user', content: state.question },
        ]);
        const splits = response.content.toString().split(';').map(s => s.trim());

        return {
            subQuestions: splits,
            trace: [{ node: 'Splitter', output: splits, timestamp: new Date() }]
        };
    }

    async finderNode(state: ResearchState) {
        let allDocs = [];
        for (const subQ of state.subQuestions) {
            const docs = await this.docModel.find({ $text: { $search: subQ } }).limit(3).exec();
            allDocs.push(...docs);
        }
        const uniqueDocs = Array.from(new Map(allDocs.map(item => [item.id, item])).values());

        return {
            rawDocuments: uniqueDocs,
            trace: [{ node: 'Finder', output: `Found ${uniqueDocs.length} unique docs`, timestamp: new Date() }]
        };
    }

    async rankerNode(state: ResearchState) {
        if (state.rawDocuments.length === 0) return {
            rankedDocuments: [],
            trace: [{ node: 'Ranker', output: 'No docs to rank', timestamp: new Date() }]
        };

        const tfidf = new natural.TfIdf();
        state.rawDocuments.forEach(doc => tfidf.addDocument(doc.content));

        const scores = state.rawDocuments.map((doc, index) => {
            let score = 0;
            const keywords = state.question.split(' ');
            keywords.forEach(kw => {
                score += tfidf.tfidf(kw, index);
            });
            return { ...doc.toObject(), relevanceScore: score };
        });

        const ranked = scores.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5);

        return {
            rankedDocuments: ranked,
            trace: [{ node: 'Ranker', output: `Ranked top ${ranked.length} docs`, timestamp: new Date() }]
        };
    }

    async summarizerNode(state: ResearchState) {
        const summaries = state.rankedDocuments.map(doc => {
            const sentences = doc.content.match(/[^\.!\?]+[\.!\?]+/g) || [doc.content];

            // Score sentences by keyword relevance using common sense ranking
            // (Looking for sentences that contain words from the user's question)
            const questionKeywords = state.question.toLowerCase().split(/\s+/).filter(w => w.length > 3);

            const scoredSentences = sentences.map((s: string) => {
                let score = 0;
                questionKeywords.forEach(kw => {
                    if (s.toLowerCase().includes(kw)) score++;
                });
                return { text: s, score };
            });

            // Pick top 3 sentences by relevance score
            const topSentences = scoredSentences
                .sort((a: any, b: any) => b.score - a.score)
                .slice(0, 3)
                .map((s: any) => s.text);

            return topSentences.join(' ');
        });

        return {
            summaries: summaries,
            trace: [{ node: 'Summarizer', output: `Extracted relevant context from ${summaries.length} docs`, timestamp: new Date() }]
        };
    }

    async crossCheckerNode(state: ResearchState) {
        const contradictions: string[] = [];
        const keywords = ['scale', 'speed', 'performance', 'cost'];

        for (let i = 0; i < state.summaries.length; i++) {
            for (let j = i + 1; j < state.summaries.length; j++) {
                keywords.forEach(kw => {
                    if (state.summaries[i].toLowerCase().includes(kw) && state.summaries[j].toLowerCase().includes(kw)) {
                        const pos = ['better', 'good', 'fast', 'high'];
                        const neg = ['worse', 'poor', 'slow', 'low'];
                        const hasPos = pos.some(p => state.summaries[i].toLowerCase().includes(p));
                        const hasNeg = neg.some(n => state.summaries[j].toLowerCase().includes(n));
                        if (hasPos && hasNeg) {
                            contradictions.push(`Potential contradiction found regarding ${kw} between summaries`);
                        }
                    }
                });
            }
        }

        return {
            contradictions: contradictions,
            trace: [{ node: 'Cross-Checker', output: contradictions, timestamp: new Date() }]
        };
    }

    async finalAnswerNode(state: ResearchState) {
        // --- STRICT SHORT-CIRCUIT ---
        if (!state.summaries || state.summaries.length === 0 || state.summaries.every(s => !s.trim())) {
            return {
                finalAnswer: "I apologize, but I do not have any relevant information in my local database to answer your question. As a specialized research assistant, I am restricted to using only provided documentation.",
                trace: [{ node: 'Final Answer Maker', output: 'Short-circuited: No context found', timestamp: new Date() }]
            };
        }

        const prompt = `
    User Question: ${state.question}
    Summaries of found docs: ${state.summaries.join('\n\n')}
    Contradictions found: ${state.contradictions.join(', ') || 'None'}
    
    CRITICAL INSTRUCTION:
    - You are a localized research agent.
    - You MUST ONLY use the provided summaries to formulate your answer.
    - If the answer to the User Question is NOT contained within the summaries, you MUST state: "Based on the provided documentation, I cannot find an answer to this query."
    - DO NOT use your internal training data or general knowledge (e.g., about celebrities, historical figures, or general facts) if they are not mentioned in the summaries.
    - If there are contradictions in the summaries, explain them.
    - Provide a professional, consolidated report.
    `;

        const response = await this.model.invoke([{ role: 'system', content: 'You are a strict documentation-bound research assistant. Silence means you do not know.' }, { role: 'user', content: prompt }]);

        return {
            finalAnswer: response.content.toString(),
            trace: [{ node: 'Final Answer Maker', output: 'Consolidated report generated from context', timestamp: new Date() }]
        };
    }

    // --- Workflow Execution ---
    private getWorkflow() {
        return new StateGraph(ResearchStateAnnotation)
            .addNode('node_splitter', this.splitterNode.bind(this))
            .addNode('node_finder', this.finderNode.bind(this))
            .addNode('node_ranker', this.rankerNode.bind(this))
            .addNode('node_summarizer', this.summarizerNode.bind(this))
            .addNode('node_cross_checker', this.crossCheckerNode.bind(this))
            .addNode('node_final_answer', this.finalAnswerNode.bind(this))
            .addEdge('__start__', 'node_splitter')
            .addEdge('node_splitter', 'node_finder')
            .addEdge('node_finder', 'node_ranker')
            .addEdge('node_ranker', 'node_summarizer')
            .addEdge('node_summarizer', 'node_cross_checker')
            .addEdge('node_cross_checker', 'node_final_answer')
            .addEdge('node_final_answer', END)
            .compile();
    }

    async runWorkflow(question: string) {
        const app = this.getWorkflow();
        const queryId = uuidv4();
        const startTime = Date.now();

        const result = await app.invoke({
            question,
            startTime,
            trace: [],
            subQuestions: [],
            rawDocuments: [],
            rankedDocuments: [],
            summaries: [],
            contradictions: [],
            finalAnswer: ''
        });

        await this.traceModel.create({
            queryId,
            question,
            steps: result.trace,
            finalAnswer: result.finalAnswer,
            totalDurationMs: Date.now() - startTime
        });

        return {
            queryId,
            answer: result.finalAnswer,
            trace: result.trace
        };
    }

    streamWorkflow(question: string): Observable<any> {
        return new Observable(observer => {
            const app = this.getWorkflow();
            const queryId = uuidv4();
            const startTime = Date.now();

            (async () => {
                const stream = await app.stream({
                    question,
                    startTime,
                    trace: [],
                    subQuestions: [],
                    rawDocuments: [],
                    rankedDocuments: [],
                    summaries: [],
                    contradictions: [],
                    finalAnswer: ''
                });

                let lastState: any = null;

                for await (const chunk of stream) {
                    const nodeName = Object.keys(chunk)[0] as keyof typeof chunk;
                    const stateUpdate: any = chunk[nodeName];
                    lastState = stateUpdate;

                    if (stateUpdate.trace) {
                        observer.next({ data: { type: 'trace', payload: stateUpdate.trace[stateUpdate.trace.length - 1] } });
                    }
                }

                if (lastState) {
                    await this.traceModel.create({
                        queryId,
                        question,
                        steps: lastState.trace,
                        finalAnswer: lastState.finalAnswer,
                        totalDurationMs: Date.now() - startTime
                    });

                    observer.next({ data: { type: 'complete', payload: { queryId, finalAnswer: lastState.finalAnswer } } });
                }
                observer.complete();
            })().catch(err => {
                observer.error(err);
            });
        });
    }

    async uploadDocs(docs: any[]) {
        return this.docModel.insertMany(docs);
    }

    async processPdf(file: any, title: string, topic: string) {
        this.logger.log(`Processing PDF: ${file.originalname} using new PDFParse syntax`);

        try {
            const parser = new PDFParse({ data: file.buffer });
            const data = await parser.getText();
            const content = data.text;

            const doc = await this.docModel.create({
                title: title || file.originalname,
                topic: topic || 'General',
                content
            });

            await parser.destroy();
            return doc;
        } catch (error) {
            this.logger.error(`Failed to parse PDF: ${error.message}`);
            throw error;
        }
    }

    async getTrace(queryId: string) {
        return this.traceModel.findOne({ queryId }).exec();
    }
}
