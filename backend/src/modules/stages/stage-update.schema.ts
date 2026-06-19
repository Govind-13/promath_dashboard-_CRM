import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type StageUpdateDocument = HydratedDocument<StageUpdate>;

@Schema({
  collection: "stageUpdates",
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
})
export class StageUpdate {
  @Prop({ required: true, index: true })
  collegeId!: string;

  @Prop({ required: true, trim: true, index: true })
  stageName!: string;

  @Prop({ required: true })
  stageIndex!: number;

  @Prop({ required: true, trim: true, index: true })
  status!: string;

  @Prop({ default: "", trim: true })
  remarks!: string;

  @Prop({ default: "", trim: true })
  completedBy!: string;

  @Prop()
  completedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const StageUpdateSchema = SchemaFactory.createForClass(StageUpdate);
StageUpdateSchema.index({ collegeId: 1, stageIndex: 1 });
