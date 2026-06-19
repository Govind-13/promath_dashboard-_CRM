import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { ImportsService } from "../modules/imports/imports.service";

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const imports = app.get(ImportsService);
  const summary = await imports.migrateStorage({
    sub: "migration-script",
    email: "migration-script",
    role: "admin",
    name: "Migration Script",
  });
  console.log(JSON.stringify(summary, null, 2));
  await app.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
