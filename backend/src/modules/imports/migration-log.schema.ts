import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type MigrationLogDocument = HydratedDocument<MigrationLog>;

@Schema({
  collection: "migrationLogs",
  timestamps: { createdAt: "createdAt", updatedAt: false },
})
export class MigrationLog {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  runBy!: string;

  @Prop({ type: Object, required: true })
  summary!: Record<string, unknown>;

  createdAt!: Date;
}

export const MigrationLogSchema = SchemaFactory.createForClass(MigrationLog);
