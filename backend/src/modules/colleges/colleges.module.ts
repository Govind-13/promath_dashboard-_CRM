import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StageUpdate, StageUpdateSchema } from "../stages/stage-update.schema";
import { College, CollegeSchema } from "./college.schema";
import { CollegesController } from "./colleges.controller";
import { CollegesService } from "./colleges.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: College.name, schema: CollegeSchema },
      { name: StageUpdate.name, schema: StageUpdateSchema },
    ]),
  ],
  controllers: [CollegesController],
  providers: [CollegesService],
  exports: [CollegesService, MongooseModule],
})
export class CollegesModule {}
