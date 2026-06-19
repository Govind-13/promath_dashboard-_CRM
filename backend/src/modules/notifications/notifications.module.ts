import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppNotification, NotificationSchema } from "./notification.schema";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: AppNotification.name, schema: NotificationSchema }])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService, MongooseModule],
})
export class NotificationsModule {}
