import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ExcelImportDocument = HydratedDocument<ExcelImport>;

@Schema({
  collection: "excelImports",
  timestamps: { createdAt: "createdAt", updatedAt: false },
})
export class ExcelImport {
  @Prop({ required: true, trim: true })
  fileName!: string;

  @Prop({ required: true, trim: true })
  importedBy!: string;

  @Prop({ default: 0 })
  totalRows!: number;

  @Prop({ default: 0 })
  successRows!: number;

  @Prop({ default: 0 })
  failedRows!: number;

  @Prop({ type: [String], default: [], alias: "errors" })
  importErrors!: string[];

  createdAt!: Date;
}

export const ExcelImportSchema = SchemaFactory.createForClass(ExcelImport);
