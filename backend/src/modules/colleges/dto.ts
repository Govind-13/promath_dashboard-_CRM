import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";

export class CollegeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() contactPerson?: string;
  @IsOptional() @IsString() designation?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @ValidateIf((_, value) => value !== "") @IsEmail() email?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() collegeType?: string;
  @IsOptional() @IsString() assignedTo?: string;
  @IsOptional() @IsString() currentStage?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() source?: string;
  @IsOptional() @IsString() notes?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}

export class CreateCollegeDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() contactPerson?: string;
  @IsOptional() @IsString() designation?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @ValidateIf((_, value) => value !== "") @IsEmail() email?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() collegeType?: string;
  @IsOptional() @IsString() assignedTo?: string;
  @IsOptional() @IsString() currentStage?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() source?: string;
  @IsOptional() @IsString() notes?: string;
}
