import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthUser } from "../../shared/auth-user";
import { StageUpdate, StageUpdateDocument } from "./stage-update.schema";
import { StageUpdateDto } from "./dto";

@Injectable()
export class StagesService {
  constructor(@InjectModel(StageUpdate.name) private readonly stages: Model<StageUpdateDocument>) {}

  list(collegeId: string) {
    return this.stages.find({ collegeId }).sort({ stageIndex: 1, createdAt: 1 }).lean();
  }

  create(collegeId: string, dto: StageUpdateDto, user: AuthUser) {
    return this.stages.create({
      collegeId,
      stageName: dto.stageName,
      stageIndex: dto.stageIndex ?? 0,
      status: dto.status ?? "in_progress",
      remarks: dto.remarks ?? "",
      completedBy: dto.status === "completed" ? user.sub : "",
      completedAt: dto.completedAt ? new Date(dto.completedAt) : dto.status === "completed" ? new Date() : undefined,
    });
  }

  async update(collegeId: string, id: string, dto: StageUpdateDto, user: AuthUser) {
    const current = await this.stages.findOne({ _id: id, collegeId });
    if (!current) throw new NotFoundException("Stage update not found");
    if (dto.stageName !== undefined) current.stageName = dto.stageName;
    if (dto.stageIndex !== undefined) current.stageIndex = dto.stageIndex;
    if (dto.status !== undefined) current.status = dto.status;
    if (dto.remarks !== undefined) current.remarks = dto.remarks;
    if (dto.status === "completed") {
      current.completedBy = user.sub;
      current.completedAt = dto.completedAt ? new Date(dto.completedAt) : new Date();
    }
    return current.save();
  }
}
