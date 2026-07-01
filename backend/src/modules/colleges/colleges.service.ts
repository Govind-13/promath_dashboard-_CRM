import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthUser } from "../../shared/auth-user";
import { College, CollegeDocument } from "./college.schema";
import { CollegeDto } from "./dto";

@Injectable()
export class CollegesService {
  constructor(@InjectModel(College.name) private readonly colleges: Model<CollegeDocument>) {}

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
    return this.colleges.create({
      ...this.pick(dto),
      name: dto.name,
      createdBy: user.sub,
      updatedBy: user.sub,
      version: 1,
    });
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
    Object.assign(current, this.pick(dto));
    current.updatedBy = user.sub;
    current.version = (current.version || 1) + 1;
    return current.save();
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
}
