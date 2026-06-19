import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { College, CollegeSchema } from "./college.schema";
import { CollegesController } from "./colleges.controller";
import { CollegesService } from "./colleges.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: College.name, schema: CollegeSchema }])],
  controllers: [CollegesController],
  providers: [CollegesService],
  exports: [CollegesService, MongooseModule],
})
export class CollegesModule {}
