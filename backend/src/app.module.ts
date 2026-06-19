import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { StorageModule } from "./modules/storage/storage.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { CollegesModule } from "./modules/colleges/colleges.module";
import { StagesModule } from "./modules/stages/stages.module";
import { BillingModule } from "./modules/billing/billing.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ImportsModule } from "./modules/imports/imports.module";
import { HealthController } from "./health.controller";
import { validateEnvironment } from "./config/env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../.env",
      validate: validateEnvironment,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>("MONGODB_URI"),
        dbName: config.get<string>("MONGO_DB") ?? "promath_crm",
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 20,
      }),
    }),
    UsersModule,
    AuthModule,
    CollegesModule,
    StagesModule,
    BillingModule,
    NotificationsModule,
    ImportsModule,
    StorageModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
