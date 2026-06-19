import { Body, Controller, Get, Header, NotFoundException, Param, Put } from "@nestjs/common";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../shared/guards/jwt-auth.guard";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { Roles } from "../../shared/decorators/roles.decorator";
import { StorageService } from "./storage.service";

@Controller("api/storage")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
// Legacy compatibility for backup and migration only. The React app no longer uses this API.
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Get(":key")
  @Header("Deprecation", "true")
  @Header("Sunset", "Wed, 31 Dec 2026 23:59:59 GMT")
  async get(@Param("key") key: string) {
    const record = await this.storage.get(key);
    if (!record) {
      throw new NotFoundException({ error: "not_found", key });
    }
    return record;
  }

  @Put(":key")
  @Header("Deprecation", "true")
  @Header("Sunset", "Wed, 31 Dec 2026 23:59:59 GMT")
  async set(@Param("key") key: string, @Body("value") value: unknown) {
    const storedValue = typeof value === "string" ? value : JSON.stringify(value);
    return this.storage.set(key, storedValue);
  }
}
