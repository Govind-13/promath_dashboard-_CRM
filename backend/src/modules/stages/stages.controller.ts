import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthRequest } from "../../shared/auth-user";
import { Roles } from "../../shared/decorators/roles.decorator";
import { JwtAuthGuard } from "../../shared/guards/jwt-auth.guard";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { CreateStageUpdateDto, StageUpdateDto } from "./dto";
import { StagesService } from "./stages.service";

@Controller("colleges/:id/stages")
@UseGuards(JwtAuthGuard, RolesGuard)
export class StagesController {
  constructor(private readonly stages: StagesService) {}

  @Get()
  @Roles("admin", "content", "implementation", "engagement", "billing")
  list(@Param("id") collegeId: string) {
    return this.stages.list(collegeId);
  }

  @Post()
  @Roles("admin", "implementation", "engagement")
  create(@Param("id") collegeId: string, @Body() dto: CreateStageUpdateDto, @Req() req: AuthRequest) {
    return this.stages.create(collegeId, dto, req.user);
  }

  @Patch(":stageUpdateId")
  @Roles("admin", "implementation", "engagement")
  update(
    @Param("id") collegeId: string,
    @Param("stageUpdateId") stageUpdateId: string,
    @Body() dto: StageUpdateDto,
    @Req() req: AuthRequest
  ) {
    return this.stages.update(collegeId, stageUpdateId, dto, req.user);
  }
}
