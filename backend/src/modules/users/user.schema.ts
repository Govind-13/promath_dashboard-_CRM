import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export const USER_ROLES = [
  "admin",
  "content",
  "implementation",
  "engagement",
  "billing",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserDocument = HydratedDocument<User>;

@Schema({
  collection: "users",
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
})
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, enum: USER_ROLES, index: true })
  role!: UserRole;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ default: "", select: false })
  resetPasswordTokenHash?: string;

  @Prop({ type: Date, default: null, select: false, index: true })
  resetPasswordExpiresAt?: Date | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
