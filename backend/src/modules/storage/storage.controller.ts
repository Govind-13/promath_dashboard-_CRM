import { Body, Controller, Get, NotFoundException, Param, Put } from "@nestjs/common";
import { StorageService } from "./storage.service";

@Controller("api/storage")
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Get(":key")
  async get(@Param("key") key: string) {
    const record = await this.storage.get(key);
    if (!record) {
      throw new NotFoundException({ error: "not_found", key });
    }
    return record;
  }

  @Put(":key")
  async set(@Param("key") key: string, @Body("value") value: unknown) {
    const storedValue = typeof value === "string" ? value : JSON.stringify(value);
    return this.storage.set(key, storedValue);
  }
}
