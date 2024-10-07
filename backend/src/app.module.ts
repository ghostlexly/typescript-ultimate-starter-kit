import { BullModule } from "@nestjs/bull";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { PassportModule } from "@nestjs/passport";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { redisStore } from "cache-manager-redis-yet";
import { CommandsModule } from "./common/commands/commands.module";
import { RolesGuard } from "./common/guards/roles.guard";
import { SessionsGuard } from "./common/guards/sessions.guard";
import { TrimPipe } from "./common/pipes/trim.pipe";
import { DatabaseModule } from "./common/providers/database/database.module";
import { RedisThrottlerStorage } from "./common/providers/throttler/redis-throttler-storage.service";
import { AuthModule } from "./modules/auth/auth.module";
import { CountriesModule } from "./modules/countries/countries.module";
import { CustomerModule } from "./modules/customer/customer.module";
import { MeModule } from "./modules/me/me.module";
import { MediaModule } from "./modules/media/media.module";
import { SupportModule } from "./modules/support/support.module";
import { TestModule } from "./modules/test/test.module";
import { PropertyModule } from "./modules/property/property.module";
import { SubscriberModule } from "./modules/subscriber/subscriber.module";
import { ListingModule } from "./modules/listing/listing.module";
import { SmsNotificationModule } from "./modules/sms-notification/sms-notification.module";
import { ShortLinkModule } from "./modules/short-link/short-link.module";

@Module({
  imports: [
    // -- Libraries
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        // default configuration
        {
          ttl: 1000 * 60 * 1, // milliseconds - 1 minute
          limit: 500,
        },
      ],
      storage: new RedisThrottlerStorage({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT ?? "6379"),
      }),
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT ?? "6379"),
      },
    }),
    ScheduleModule.forRoot(),

    CacheModule.registerAsync({
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.getOrThrow("REDIS_HOST"),
            port: configService.getOrThrow("REDIS_PORT"),
          },
          ttl: 5000, // default ttl in milliseconds
        }),
      }),
    }),

    // -- Common
    DatabaseModule,
    CommandsModule,
    MediaModule,
    CountriesModule,

    // -- Auth
    PassportModule,
    AuthModule,
    MeModule,

    // -- Business modules
    TestModule,
    CustomerModule,
    SupportModule,
    PropertyModule,
    SubscriberModule,
    ListingModule,
    SmsNotificationModule,
    ShortLinkModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD, // enable guard globally on all routes
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SessionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_PIPE,
      useClass: TrimPipe,
    },
  ],
})
export class AppModule {}
