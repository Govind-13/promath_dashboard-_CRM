import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthRequest } from "../../shared/auth-user";
import { Roles } from "../../shared/decorators/roles.decorator";
import { JwtAuthGuard } from "../../shared/guards/jwt-auth.guard";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { BillingService } from "./billing.service";
import { BillingProposalDto, CreateBillingProposalDto } from "./dto";

@Controller("billing/proposals")
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get()
  @Roles("admin", "billing")
  list() {
    return this.billing.list();
  }

  @Get(":id")
  @Roles("admin", "billing")
  get(@Param("id") id: string) {
    return this.billing.get(id);
  }

  @Post()
  @Roles("admin", "billing")
  create(@Body() dto: CreateBillingProposalDto, @Req() req: AuthRequest) {
    return this.billing.create(dto, req.user);
  }

  @Patch(":id")
  @Roles("admin", "billing")
  update(@Param("id") id: string, @Body() dto: BillingProposalDto, @Req() req: AuthRequest) {
    return this.billing.update(id, dto, req.user);
  }

  @Delete(":id")
  @Roles("admin", "billing")
  delete(@Param("id") id: string) {
    return this.billing.delete(id);
  }
}
