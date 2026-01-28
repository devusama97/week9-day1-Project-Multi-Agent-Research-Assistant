import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResearchDocument, ResearchDocumentSchema } from '../schemas/document.schema';
import { ResearchTrace, ResearchTraceSchema } from '../schemas/trace.schema';
import { ResearchService } from './research.service';
import { ResearchController } from './research.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ResearchDocument.name, schema: ResearchDocumentSchema },
            { name: ResearchTrace.name, schema: ResearchTraceSchema },
        ]),
    ],
    providers: [ResearchService],
    controllers: [ResearchController],
    exports: [ResearchService],
})
export class ResearchModule { }
