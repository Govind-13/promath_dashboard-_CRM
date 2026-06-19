import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type BillingProposalDocument = HydratedDocument<BillingProposal>;

@Schema({
  collection: "billingProposals",
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
})
export class BillingProposal {
  @Prop({ default: "", index: true })
  collegeId!: string;

  @Prop({ required: true, unique: true, index: true, trim: true })
  proposalNumber!: string;

  @Prop({ required: true, trim: true })
  proposalTitle!: string;

  @Prop({ default: 0 })
  amount!: number;

  @Prop({ default: 0 })
  discount!: number;

  @Prop({ default: 0 })
  finalAmount!: number;

  @Prop({ default: "draft", index: true })
  status!: string;

  @Prop({ default: "", trim: true })
  generatedBy!: string;

  @Prop()
  generatedAt?: Date;

  @Prop()
  validUntil?: Date;

  @Prop({ default: "", trim: true })
  notes!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const BillingProposalSchema = SchemaFactory.createForClass(BillingProposal);
