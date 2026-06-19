import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthUser } from "../../shared/auth-user";
import { BillingProposal, BillingProposalDocument } from "../billing/billing-proposal.schema";
import { College, CollegeDocument } from "../colleges/college.schema";
import { AppNotification, NotificationDocument } from "../notifications/notification.schema";
import { StageUpdate, StageUpdateDocument } from "../stages/stage-update.schema";
import { StorageDocument, StorageRecord } from "../storage/storage.schema";
import { ExcelImportDto, MigrationSummary } from "./dto";
import { ExcelImport, ExcelImportDocument } from "./excel-import.schema";
import { MigrationLog, MigrationLogDocument } from "./migration-log.schema";

const CRM_STORAGE_KEY = "promath_crm_v13";
const BILLING_STORAGE_KEY = "promath_billing_v2";

@Injectable()
export class ImportsService {
  constructor(
    @InjectModel(ExcelImport.name) private readonly excelImports: Model<ExcelImportDocument>,
    @InjectModel(MigrationLog.name) private readonly migrationLogs: Model<MigrationLogDocument>,
    @InjectModel(StorageRecord.name) private readonly storage: Model<StorageDocument>,
    @InjectModel(College.name) private readonly colleges: Model<CollegeDocument>,
    @InjectModel(StageUpdate.name) private readonly stages: Model<StageUpdateDocument>,
    @InjectModel(BillingProposal.name) private readonly proposals: Model<BillingProposalDocument>,
    @InjectModel(AppNotification.name) private readonly notifications: Model<NotificationDocument>
  ) {}

  list() {
    return this.excelImports.find().sort({ createdAt: -1 }).lean();
  }

  async createExcelImport(dto: ExcelImportDto, user: AuthUser) {
    const rows = dto.rows ?? [];
    return this.excelImports.create({
      fileName: dto.fileName ?? "manual-import",
      importedBy: user.sub,
      totalRows: rows.length,
      successRows: rows.length,
      failedRows: 0,
      importErrors: [],
    });
  }

  async migrateStorage(user: AuthUser): Promise<MigrationSummary> {
    const summary: MigrationSummary = {
      collegesCreated: 0,
      stagesCreated: 0,
      billingProposalsCreated: 0,
      notificationsCreated: 0,
      skipped: 0,
      failed: [],
    };

    const crm = await this.readStorageJson(CRM_STORAGE_KEY);
    const billing = await this.readStorageJson(BILLING_STORAGE_KEY);
    const collegeIdMap = new Map<string, string>();

    for (const legacyCollege of crm?.colleges ?? []) {
      try {
        const mapped = this.mapCollege(legacyCollege, user);
        if (!mapped.name) {
          summary.skipped += 1;
          continue;
        }
        let college = await this.findCollegeMatch(mapped);
        if (!college) {
          college = await this.colleges.create(mapped);
          summary.collegesCreated += 1;
        } else {
          summary.skipped += 1;
        }
        collegeIdMap.set(String(legacyCollege.id ?? mapped.name), String(college._id));
        const stageCount = await this.migrateStages(String(college._id), legacyCollege.stages ?? {}, user);
        summary.stagesCreated += stageCount;
      } catch (error) {
        summary.failed.push(`college:${legacyCollege?.name ?? "unknown"}:${this.message(error)}`);
      }
    }

    for (const legacyNotification of crm?.notifications ?? []) {
      try {
        await this.notifications.create({
          title: legacyNotification.title ?? "CRM notification",
          message: legacyNotification.message ?? "",
          type: legacyNotification.type ?? "info",
          targetRole: legacyNotification.role ?? legacyNotification.targetRole ?? "",
          targetUser: legacyNotification.targetUser ?? "",
          isRead: Boolean(legacyNotification.read ?? legacyNotification.isRead),
          createdBy: user.sub,
          createdAt: legacyNotification.timestamp ? new Date(legacyNotification.timestamp) : new Date(),
        });
        summary.notificationsCreated += 1;
      } catch (error) {
        summary.failed.push(`notification:${this.message(error)}`);
      }
    }

    for (const legacyProposal of billing?.proposals ?? []) {
      try {
        const collegeId = collegeIdMap.get(String(legacyProposal.college_id ?? ""));
        const proposalNumber = legacyProposal.proposalNumber ?? legacyProposal.id ?? `LEG-${Date.now()}-${summary.billingProposalsCreated + 1}`;
        const exists = await this.proposals.findOne({ proposalNumber });
        if (exists) {
          summary.skipped += 1;
          continue;
        }
        const amount = Number(legacyProposal.total_value ?? legacyProposal.amount ?? 0);
        const discount = Number(legacyProposal.discount ?? 0);
        await this.proposals.create({
          collegeId: collegeId ?? "",
          proposalNumber,
          proposalTitle: legacyProposal.proposalTitle ?? legacyProposal.college_name ?? "Legacy proposal",
          amount,
          discount,
          finalAmount: Number(legacyProposal.finalAmount ?? amount - discount),
          status: legacyProposal.status ?? "draft",
          generatedBy: user.sub,
          generatedAt: legacyProposal.created_at ? new Date(legacyProposal.created_at) : new Date(),
          validUntil: legacyProposal.validUntil ? new Date(legacyProposal.validUntil) : undefined,
          notes: legacyProposal.notes ?? "",
        });
        summary.billingProposalsCreated += 1;
      } catch (error) {
        summary.failed.push(`proposal:${legacyProposal?.id ?? "unknown"}:${this.message(error)}`);
      }
    }

    await this.migrationLogs.create({
      name: "blob-storage-v13-to-collections",
      runBy: user.sub,
      summary: { ...summary },
    });
    return summary;
  }

  private async readStorageJson(key: string) {
    const row = await this.storage.findOne({ key }).lean();
    if (!row?.value) return null;
    try {
      return JSON.parse(row.value);
    } catch {
      return null;
    }
  }

  private mapCollege(legacy: Record<string, any>, user: AuthUser) {
    return {
      name: legacy.name ?? "",
      location: legacy.location ?? "",
      district: legacy.district ?? "",
      state: legacy.state ?? "",
      contactPerson: legacy.contact_name ?? legacy.contactPerson ?? "",
      designation: legacy.contact_designation ?? legacy.designation ?? "",
      phone: legacy.phone ?? "",
      email: String(legacy.email ?? "").toLowerCase(),
      website: legacy.website ?? "",
      collegeType: legacy.college_type ?? legacy.collegeType ?? "",
      assignedTo: legacy.assignedTo ?? "",
      currentStage: legacy.currentStage ?? "",
      status: legacy.current_status ?? legacy.status ?? "active",
      priority: legacy.priority ?? "medium",
      source: legacy.source ?? "legacy_blob",
      notes: legacy.additional_comments ?? legacy.notes ?? "",
      createdBy: user.sub,
      updatedBy: user.sub,
      version: 1,
    };
  }

  private async findCollegeMatch(mapped: { name: string; email: string; phone: string }) {
    const clauses = [];
    if (mapped.email) clauses.push({ email: mapped.email });
    if (mapped.phone) clauses.push({ phone: mapped.phone });
    if (mapped.name) clauses.push({ name: mapped.name });
    if (!clauses.length) return null;
    return this.colleges.findOne({ $or: clauses });
  }

  private async migrateStages(collegeId: string, stages: Record<string, any>, user: AuthUser) {
    let created = 0;
    let index = 0;
    for (const [stageName, stage] of Object.entries(stages)) {
      const exists = await this.stages.findOne({ collegeId, stageName });
      if (exists) {
        index += 1;
        continue;
      }
      await this.stages.create({
        collegeId,
        stageName,
        stageIndex: index,
        status: stage?.status ?? "not_started",
        remarks: stage?.data ? JSON.stringify(stage.data) : "",
        completedBy: stage?.status === "completed" ? user.sub : "",
        completedAt: stage?.completed_at ? new Date(stage.completed_at) : undefined,
      });
      created += 1;
      index += 1;
    }
    return created;
  }

  private message(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }
}
