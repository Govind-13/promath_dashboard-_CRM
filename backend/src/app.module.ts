import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { StorageModule } from "./modules/storage/storage.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: "../.env" }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>("MONGO_URI") ?? "mongodb://localhost:27017/promath_crm",
        dbName: config.get<string>("MONGO_DB") ?? "promath_crm",
      }),
    }),
    StorageModule,
  ],
})
export class AppModule {}
