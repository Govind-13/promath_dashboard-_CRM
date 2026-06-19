import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StageUpdate, StageUpdateSchema } from "./stage-update.schema";
import { StagesController } from "./stages.controller";
import { StagesService } from "./stages.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: StageUpdate.name, schema: StageUpdateSchema }])],
  controllers: [StagesController],
  providers: [StagesService],
  exports: [StagesService, MongooseModule],
})
export class StagesModule {}
