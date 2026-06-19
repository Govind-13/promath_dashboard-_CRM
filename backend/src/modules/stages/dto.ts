import { IsDateString, IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

export class StageUpdateDto {
  @IsOptional() @IsString() stageName?: string;
  @IsOptional() @IsInt() @Min(0) stageIndex?: number;
  @IsOptional() @IsIn(["not_started", "in_progress", "completed"]) status?: string;
  @IsOptional() @IsString() remarks?: string;
  @IsOptional() @IsDateString() completedAt?: string;
}

export class CreateStageUpdateDto {
  @IsString()
  stageName!: string;
  @IsOptional() @IsInt() @Min(0) stageIndex?: number;
  @IsOptional() @IsIn(["not_started", "in_progress", "completed"]) status?: string;
  @IsOptional() @IsString() remarks?: string;
  @IsOptional() @IsDateString() completedAt?: string;
}
