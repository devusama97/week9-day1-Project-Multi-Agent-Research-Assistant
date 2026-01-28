import { Controller, Post, Body, Get, Param, UseInterceptors, UploadedFile, Sse, Query } from '@nestjs/common';
import { ResearchService } from './research.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { map } from 'rxjs';

@Controller('research')
export class ResearchController {
    constructor(private readonly researchService: ResearchService) { }

    @Post('ask')
    async ask(@Body('question') question: string) {
        return this.researchService.runWorkflow(question);
    }

    @Post('upload')
    async upload(@Body() docs: any[]) {
        return this.researchService.uploadDocs(docs);
    }

    @Post('upload-pdf')
    @UseInterceptors(FileInterceptor('file'))
    async uploadPdf(
        @UploadedFile() file: any,
        @Body('title') title: string,
        @Body('topic') topic: string,
    ) {
        return this.researchService.processPdf(file, title, topic);
    }

    @Sse('ask-live')
    askLive(@Query('question') question: string) {
        return this.researchService.streamWorkflow(question);
    }

    @Get('trace/:id')
    async getTrace(@Param('id') queryId: string) {
        return this.researchService.getTrace(queryId);
    }
}
