import { IsArray, IsObject, IsOptional, IsString, MinLength } from "class-validator";

export class ExcelImportDto {
  @IsString()
  @MinLength(1)
  fileName!: string;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  rows?: Record<string, unknown>[];
}

export interface MigrationSummary {
  collegesCreated: number;
  stagesCreated: number;
  billingProposalsCreated: number;
  notificationsCreated: number;
  skipped: number;
  failed: string[];
}
