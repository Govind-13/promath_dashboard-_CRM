import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BillingProposal, BillingProposalSchema } from "../billing/billing-proposal.schema";
import { College, CollegeSchema } from "../colleges/college.schema";
import { AppNotification, NotificationSchema } from "../notifications/notification.schema";
import { StageUpdate, StageUpdateSchema } from "../stages/stage-update.schema";
import { StorageRecord, StorageSchema } from "../storage/storage.schema";
import { ExcelImport, ExcelImportSchema } from "./excel-import.schema";
import { ImportsController } from "./imports.controller";
import { ImportsService } from "./imports.service";
import { MigrationLog, MigrationLogSchema } from "./migration-log.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExcelImport.name, schema: ExcelImportSchema },
      { name: MigrationLog.name, schema: MigrationLogSchema },
      { name: StorageRecord.name, schema: StorageSchema },
      { name: College.name, schema: CollegeSchema },
      { name: StageUpdate.name, schema: StageUpdateSchema },
      { name: BillingProposal.name, schema: BillingProposalSchema },
      { name: AppNotification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
