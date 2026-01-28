import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ResearchDocument extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  topic: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ResearchDocumentSchema = SchemaFactory.createForClass(ResearchDocument);
// Add text index for searching
ResearchDocumentSchema.index({ title: 'text', content: 'text' });
