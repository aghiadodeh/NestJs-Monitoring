import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';


export type RequestLogDocument = RequestLog & Document;

@Schema({ timestamps: true })
export class RequestLog extends Document {
    @Prop({ default: null })
    key: string;

    @Prop({ default: null })
    url: string;

    @Prop({ default: null })
    method: string;
    
    @Prop({ default: null })
    user: mongoose.Schema.Types.Mixed;
    
    @Prop({ default: null })
    request: mongoose.Schema.Types.Mixed;

    @Prop({ default: null })
    response: mongoose.Schema.Types.Mixed;

    @Prop({ default: null })
    responseHeaders: mongoose.Schema.Types.Mixed;

    @Prop({ default: null })
    success: boolean;

    @Prop({ default: null })
    duration: number;
}

export const RequestLogSchema = SchemaFactory.createForClass(RequestLog);