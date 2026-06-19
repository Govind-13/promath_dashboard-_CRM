import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";

export class BillingProposalDto {
  @IsOptional() @IsString() collegeId?: string;
  @IsOptional() @IsString() @MinLength(1) proposalNumber?: string;
  @IsOptional() @IsString() @MinLength(1) proposalTitle?: string;
  @IsOptional() @IsNumber() @Min(0) amount?: number;
  @IsOptional() @IsNumber() @Min(0) discount?: number;
  @IsOptional() @IsNumber() @Min(0) finalAmount?: number;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsDateString() generatedAt?: string;
  @IsOptional() @IsDateString() validUntil?: string;
  @IsOptional() @IsString() notes?: string;
}

export class CreateBillingProposalDto {
  @IsOptional() @IsString() collegeId?: string;
  @IsString() @MinLength(1) proposalNumber!: string;
  @IsString() @MinLength(1) proposalTitle!: string;
  @IsOptional() @IsNumber() @Min(0) amount?: number;
  @IsOptional() @IsNumber() @Min(0) discount?: number;
  @IsOptional() @IsNumber() @Min(0) finalAmount?: number;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsDateString() generatedAt?: string;
  @IsOptional() @IsDateString() validUntil?: string;
  @IsOptional() @IsString() notes?: string;
}
