import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthRequest } from "../../shared/auth-user";
import { Roles } from "../../shared/decorators/roles.decorator";
import { JwtAuthGuard } from "../../shared/guards/jwt-auth.guard";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { ExcelImportDto } from "./dto";
import { ImportsService } from "./imports.service";

@Controller("imports")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImportsController {
  constructor(private readonly imports: ImportsService) {}

  @Post("excel")
  @Roles("admin")
  createExcelImport(@Body() dto: ExcelImportDto, @Req() req: AuthRequest) {
    return this.imports.createExcelImport(dto, req.user);
  }

  @Get()
  @Roles("admin")
  list() {
    return this.imports.list();
  }

  @Post("migrate-storage")
  @Roles("admin")
  migrateStorage(@Req() req: AuthRequest) {
    return this.imports.migrateStorage(req.user);
  }
}
