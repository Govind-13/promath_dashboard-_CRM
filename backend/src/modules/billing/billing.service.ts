import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthUser } from "../../shared/auth-user";
import { BillingProposal, BillingProposalDocument } from "./billing-proposal.schema";
import { BillingProposalDto } from "./dto";

@Injectable()
export class BillingService {
  constructor(@InjectModel(BillingProposal.name) private readonly proposals: Model<BillingProposalDocument>) {}

  list() {
    return this.proposals.find().sort({ createdAt: -1 }).lean();
  }

  async get(id: string) {
    const proposal = await this.proposals.findById(id).lean();
    if (!proposal) throw new NotFoundException("Billing proposal not found");
    return proposal;
  }

  create(dto: BillingProposalDto, user: AuthUser) {
    const amount = Number(dto.amount ?? 0);
    const discount = Number(dto.discount ?? 0);
    return this.proposals.create({
      ...dto,
      amount,
      discount,
      finalAmount: Number(dto.finalAmount ?? amount - discount),
      generatedBy: user.sub,
      generatedAt: dto.generatedAt ? new Date(dto.generatedAt) : new Date(),
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
    });
  }

  async update(id: string, dto: BillingProposalDto, user: AuthUser) {
    const proposal = await this.proposals.findById(id);
    if (!proposal) throw new NotFoundException("Billing proposal not found");
    const fields: (keyof BillingProposalDto)[] = [
      "collegeId",
      "proposalNumber",
      "proposalTitle",
      "amount",
      "discount",
      "finalAmount",
      "status",
      "notes",
    ];
    for (const field of fields) {
      if (dto[field] !== undefined) {
        (proposal as unknown as Record<string, unknown>)[field] = dto[field];
      }
    }
    if (dto.amount !== undefined || dto.discount !== undefined || dto.finalAmount === undefined) {
      proposal.finalAmount = Number(proposal.amount ?? 0) - Number(proposal.discount ?? 0);
    }
    if (dto.generatedAt) proposal.generatedAt = new Date(dto.generatedAt);
    if (dto.validUntil) proposal.validUntil = new Date(dto.validUntil);
    proposal.generatedBy = proposal.generatedBy || user.sub;
    return proposal.save();
  }

  async delete(id: string) {
    const deleted = await this.proposals.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException("Billing proposal not found");
    return { deleted: true, id };
  }
}
