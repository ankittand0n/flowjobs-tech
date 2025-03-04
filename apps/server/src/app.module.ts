import path from "node:path";

import { HttpException, Module } from "@nestjs/common";
import { APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ZodValidationPipe } from "nestjs-zod";

import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "./config/config.module";
import { ContributorsModule } from "./contributors/contributors.module";
import { DatabaseModule } from "./database/database.module";
import { FeatureModule } from "./feature/feature.module";
import { HealthModule } from "./health/health.module";
import { MailModule } from "./mail/mail.module";
import { PrinterModule } from "./printer/printer.module";
import { ResumeModule } from "./resume/resume.module";
import { StorageModule } from "./storage/storage.module";
import { TranslationModule } from "./translation/translation.module";
import { UserModule } from "./user/user.module";
import { JobModule } from "./job/job.module";
import { JobApplicationModule } from "./job-application/job-application.module";
import { OpenAIModule } from './openai/openai.module';
import { MockTestModule } from "./mock-test/mock-test.module";
import { CommunityModule } from "./modules/community/community.module";
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    // Core Modules
    ConfigModule,
    DatabaseModule,
    MailModule,
    HealthModule,
    JobApplicationModule,
    JobModule,
    OpenAIModule,
    AdminModule,
    PaymentModule,

    // Feature Modules
    AuthModule.register(),
    UserModule,
    ResumeModule,
    StorageModule,
    PrinterModule,
    FeatureModule,
    TranslationModule,
    ContributorsModule,
    CommunityModule,

    // Static Assets
    ServeStaticModule.forRoot({
      serveRoot: "/artboard",
      rootPath: path.join(__dirname, "..", "artboard"),
    }),
    ServeStaticModule.forRoot({
      renderPath: "/*",
      rootPath: path.join(__dirname, "..", "client"),
    }),
    MockTestModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    }
  ],
})
export class AppModule {}
