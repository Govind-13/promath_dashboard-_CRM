import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthUser } from "../../shared/auth-user";
import { AppNotification, NotificationDocument } from "./notification.schema";
import { NotificationDto } from "./dto";

@Injectable()
export class NotificationsService {
  constructor(@InjectModel(AppNotification.name) private readonly notifications: Model<NotificationDocument>) {}

  list(user: AuthUser) {
    const visibility =
      user.role === "admin"
        ? {}
        : { $or: [{ targetUser: user.sub }, { targetRole: user.role }, { targetRole: "" }] };
    return this.notifications.find(visibility).sort({ createdAt: -1 }).lean();
  }

  create(dto: NotificationDto, user: AuthUser) {
    return this.notifications.create({
      title: dto.title,
      message: dto.message,
      type: dto.type ?? "info",
      targetRole: dto.targetRole ?? "",
      targetUser: dto.targetUser ?? "",
      isRead: false,
      createdBy: user.sub,
    });
  }

  async markRead(id: string, user: AuthUser) {
    const visibility =
      user.role === "admin"
        ? { _id: id }
        : {
            _id: id,
            $or: [{ targetUser: user.sub }, { targetRole: user.role }, { targetRole: "" }],
          };
    const row = await this.notifications.findOneAndUpdate(visibility, { isRead: true }, { new: true }).lean();
    if (!row) throw new NotFoundException("Notification not found");
    return row;
  }

  async delete(id: string) {
    const deleted = await this.notifications.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException("Notification not found");
    return { deleted: true, id };
  }
}
