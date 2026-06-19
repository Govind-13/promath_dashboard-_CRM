import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { Roles } from "../../shared/decorators/roles.decorator";
import { JwtAuthGuard } from "../../shared/guards/jwt-auth.guard";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { AuthRequest } from "../../shared/auth-user";
import { CollegesService } from "./colleges.service";
import { CollegeDto, CreateCollegeDto } from "./dto";

@Controller("colleges")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CollegesController {
  constructor(private readonly colleges: CollegesService) {}

  @Get()
  @Roles("admin", "content", "implementation", "engagement", "billing")
  list() {
    return this.colleges.list();
  }

  @Get(":id")
  @Roles("admin", "content", "implementation", "engagement", "billing")
  get(@Param("id") id: string) {
    return this.colleges.get(id);
  }

  @Post()
  @Roles("admin")
  create(@Body() dto: CreateCollegeDto, @Req() req: AuthRequest) {
    return this.colleges.create(dto, req.user);
  }

  @Patch(":id")
  @Roles("admin", "implementation", "engagement")
  update(@Param("id") id: string, @Body() dto: CollegeDto, @Req() req: AuthRequest) {
    return this.colleges.update(id, dto, req.user);
  }

  @Delete(":id")
  @Roles("admin")
  delete(@Param("id") id: string) {
    return this.colleges.delete(id);
  }
}
