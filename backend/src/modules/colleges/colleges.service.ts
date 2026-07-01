import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthUser } from "../../shared/auth-user";
import { StageUpdate, StageUpdateDocument } from "../stages/stage-update.schema";
import { College, CollegeDocument } from "./college.schema";
import { CollegeDto } from "./dto";

const PIPELINE_STAGE_MAP: Record<string, { stageName: string; stageIndex: number; status: string }> = {
  Discovery: { stageName: "initial_meeting", stageIndex: 0, status: "in_progress" },
  Deal: { stageName: "pricing_negotiation", stageIndex: 3, status: "in_progress" },
  Content: { stageName: "syllabus_submission", stageIndex: 5, status: "in_progress" },
  Implementation: { stageName: "student_data", stageIndex: 8, status: "in_progress" },
  Onboarding: { stageName: "orientation", stageIndex: 13, status: "in_progress" },
  Complete: { stageName: "orientation", stageIndex: 13, status: "completed" },
};

@Injectable()
export class CollegesService {
  constructor(
    @InjectModel(College.name) private readonly colleges: Model<CollegeDocument>,
    @InjectModel(StageUpdate.name) private readonly stages: Model<StageUpdateDocument>,
  ) {}

  list() {
    return this.colleges.find().sort({ updatedAt: -1 }).lean().then(rows =>
      rows.map(row => ({
        ...row,
        currentStage: row.currentStage || row.pipeline_stage || "",
        pipeline_stage: row.pipeline_stage || row.currentStage || "",
      })),
    );
  }

  async get(id: string) {
    const college = await this.colleges.findById(id).lean();
    if (!college) throw new NotFoundException("College not found");
    return {
      ...college,
      currentStage: college.currentStage || college.pipeline_stage || "",
      pipeline_stage: college.pipeline_stage || college.currentStage || "",
    };
  }

  async create(dto: CollegeDto, user: AuthUser) {
    const created = await this.colleges.create({
      ...this.pick(dto),
      name: dto.name,
      createdBy: user.sub,
      updatedBy: user.sub,
      version: 1,
    });
    await this.syncPipelineStageUpdate(String(created._id), created.currentStage || created.pipeline_stage, user);
    return created;
  }

  async update(id: string, dto: CollegeDto, user: AuthUser) {
    const current = await this.colleges.findById(id);
    if (!current) throw new NotFoundException("College not found");
    if (typeof dto.version === "number" && dto.version !== current.version) {
      throw new ConflictException({
        error: "version_conflict",
        message: "College was updated by another user. Refresh and try again.",
        currentVersion: current.version,
      });
    }
    const previousStage = current.currentStage || current.pipeline_stage || "";
    const picked = this.pick(dto);
    Object.assign(current, picked);
    current.updatedBy = user.sub;
    current.version = (current.version || 1) + 1;
    const saved = await current.save();
    const nextStage = saved.currentStage || saved.pipeline_stage || "";
    if (nextStage && nextStage !== previousStage) {
      await this.syncPipelineStageUpdate(id, nextStage, user);
    }
    return saved;
  }

  async delete(id: string) {
    const deleted = await this.colleges.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException("College not found");
    return { deleted: true, id };
  }

  async findMigrationMatch(input: { name?: string; email?: string; phone?: string }) {
    const clauses = [];
    if (input.email) clauses.push({ email: input.email.toLowerCase() });
    if (input.phone) clauses.push({ phone: input.phone });
    if (input.name) clauses.push({ name: input.name });
    if (!clauses.length) return null;
    return this.colleges.findOne({ $or: clauses });
  }

  private pick(dto: CollegeDto) {
    const fields: (keyof CollegeDto)[] = [
      "name",
      "location",
      "district",
      "state",
      "contactPerson",
      "designation",
      "phone",
      "email",
      "website",
      "collegeType",
      "assignedTo",
      "currentStage",
      "pipeline_stage",
      "status",
      "priority",
      "source",
      "notes",
    ];
    const result: Record<string, unknown> = {};
    for (const field of fields) {
      if (dto[field] !== undefined) result[field] = dto[field];
    }
    if (typeof result.email === "string") result.email = result.email.toLowerCase();
    const stage = result.currentStage ?? result.pipeline_stage;
    if (typeof stage === "string") {
      result.currentStage = stage;
      result.pipeline_stage = stage;
    }
    return result;
  }

  private async syncPipelineStageUpdate(collegeId: string, pipelineStage: string | undefined, user: AuthUser) {
    if (!pipelineStage) return;
    const stage = PIPELINE_STAGE_MAP[pipelineStage];
    if (!stage) return;

    const remarks = JSON.stringify({
      source: "kanban_drag_drop",
      pipelineStage,
      updatedAt: new Date().toISOString(),
    });
    const existing = await this.stages.findOne({ collegeId, stageName: stage.stageName });
    if (existing) {
      existing.stageIndex = stage.stageIndex;
      existing.status = stage.status;
      existing.remarks = remarks;
      if (stage.status === "completed") {
        existing.completedBy = user.sub;
        existing.completedAt = existing.completedAt ?? new Date();
      }
      await existing.save();
      return;
    }

    await this.stages.create({
      collegeId,
      stageName: stage.stageName,
      stageIndex: stage.stageIndex,
      status: stage.status,
      remarks,
      completedBy: stage.status === "completed" ? user.sub : "",
      completedAt: stage.status === "completed" ? new Date() : undefined,
    });
  }
}
