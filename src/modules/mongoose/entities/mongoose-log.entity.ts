import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

export type MongooseLogDocument = MongooseLog & Document;

@Schema({ timestamps: true, collection: "monitoring_mongoose_logs", versionKey: false })
export class MongooseLog extends Document {
  @Prop({ default: null })
  collectionName: string;

  @Prop({ default: null })
  method: string;

  @Prop({ default: null })
  query: mongoose.Schema.Types.Mixed;

  @Prop()
  update: mongoose.Schema.Types.Mixed;

  @Prop({ default: null })
  options: mongoose.Schema.Types.Mixed;

  @Prop({ default: null })
  result: mongoose.Schema.Types.Mixed;

  @Prop()
  duration: number;
}

export const MongooseLogSchema = SchemaFactory.createForClass(MongooseLog);
