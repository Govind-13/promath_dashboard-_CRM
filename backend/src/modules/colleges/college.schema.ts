import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CollegeDocument = HydratedDocument<College>;

@Schema({
  collection: "colleges",
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
})
export class College {
  @Prop({ required: true, trim: true, index: true })
  name!: string;

  @Prop({ default: "", trim: true })
  location!: string;

  @Prop({ default: "", trim: true })
  district!: string;

  @Prop({ default: "", trim: true })
  state!: string;

  @Prop({ default: "", trim: true })
  contactPerson!: string;

  @Prop({ default: "", trim: true })
  designation!: string;

  @Prop({ default: "", trim: true, index: true })
  phone!: string;

  @Prop({ default: "", trim: true, lowercase: true, index: true })
  email!: string;

  @Prop({ default: "", trim: true })
  website!: string;

  @Prop({ default: "", trim: true })
  collegeType!: string;

  @Prop({ default: "", trim: true, index: true })
  assignedTo!: string;

  @Prop({ default: "", trim: true, index: true })
  currentStage!: string;

  @Prop({ default: "active", trim: true, index: true })
  status!: string;

  @Prop({ default: "medium", trim: true, index: true })
  priority!: string;

  @Prop({ default: "", trim: true })
  source!: string;

  @Prop({ default: "", trim: true })
  notes!: string;

  @Prop({ default: "", trim: true })
  createdBy!: string;

  @Prop({ default: "", trim: true })
  updatedBy!: string;

  @Prop({ default: 1 })
  version!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CollegeSchema = SchemaFactory.createForClass(College);
CollegeSchema.index({ name: 1, email: 1, phone: 1 });
