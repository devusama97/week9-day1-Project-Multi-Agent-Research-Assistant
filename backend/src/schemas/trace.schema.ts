import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ResearchTrace extends Document {
    @Prop({ required: true })
    queryId: string;

    @Prop({ required: true })
    question: string;

    @Prop({ type: [Object] })
    steps: Array<{
        node: string;
        timestamp: Date;
        data: any;
    }>;

    @Prop()
    finalAnswer: string;

    @Prop()
    totalDurationMs: number;
}

export const ResearchTraceSchema = SchemaFactory.createForClass(ResearchTrace);
