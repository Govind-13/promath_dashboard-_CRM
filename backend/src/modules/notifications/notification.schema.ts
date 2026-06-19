import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type NotificationDocument = HydratedDocument<AppNotification>;

@Schema({
  collection: "notifications",
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
})
export class AppNotification {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  message!: string;

  @Prop({ default: "info", trim: true, index: true })
  type!: string;

  @Prop({ default: "", trim: true, index: true })
  targetRole!: string;

  @Prop({ default: "", trim: true, index: true })
  targetUser!: string;

  @Prop({ default: false, index: true })
  isRead!: boolean;

  @Prop({ default: "", trim: true })
  createdBy!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(AppNotification);
