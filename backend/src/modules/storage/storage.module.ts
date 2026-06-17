import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StorageController } from "./storage.controller";
import { StorageRecord, StorageSchema } from "./storage.schema";
import { StorageService } from "./storage.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StorageRecord.name, schema: StorageSchema }]),
  ],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
