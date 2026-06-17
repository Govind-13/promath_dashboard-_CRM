import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type StorageDocument = HydratedDocument<StorageRecord>;

@Schema({ collection: "app_storage", timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })
export class StorageRecord {
  @Prop({ required: true, unique: true, index: true })
  key!: string;

  @Prop({ required: true })
  value!: string;
}

export const StorageSchema = SchemaFactory.createForClass(StorageRecord);
