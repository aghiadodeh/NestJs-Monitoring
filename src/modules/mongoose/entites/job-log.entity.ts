import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type JobLogDocument = JobLog & Document;

@Schema({ timestamps: true })
export class JobLog extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ default: true })
    success: boolean;

    @Prop({ default: [] })
    metadata: mongoose.Schema.Types.Mixed[];
}

export const JobLogSchema = SchemaFactory.createForClass(JobLog);
