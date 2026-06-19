import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BillingProposal, BillingProposalSchema } from "./billing-proposal.schema";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: BillingProposal.name, schema: BillingProposalSchema }])],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService, MongooseModule],
})
export class BillingModule {}
