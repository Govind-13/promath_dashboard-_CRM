import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthRequest } from "../../shared/auth-user";
import { Roles } from "../../shared/decorators/roles.decorator";
import { JwtAuthGuard } from "../../shared/guards/jwt-auth.guard";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { NotificationDto } from "./dto";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @Roles("admin", "content", "implementation", "engagement", "billing")
  list(@Req() req: AuthRequest) {
    return this.notifications.list(req.user);
  }

  @Post()
  @Roles("admin")
  create(@Body() dto: NotificationDto, @Req() req: AuthRequest) {
    return this.notifications.create(dto, req.user);
  }

  @Patch(":id/read")
  @Roles("admin", "content", "implementation", "engagement", "billing")
  markRead(@Param("id") id: string, @Req() req: AuthRequest) {
    return this.notifications.markRead(id, req.user);
  }

  @Delete(":id")
  @Roles("admin")
  delete(@Param("id") id: string) {
    return this.notifications.delete(id);
  }
}
