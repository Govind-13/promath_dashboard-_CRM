import { IsOptional, IsString, MinLength } from "class-validator";

export class NotificationDto {
  @IsString() @MinLength(1) title!: string;
  @IsString() @MinLength(1) message!: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() targetRole?: string;
  @IsOptional() @IsString() targetUser?: string;
}
