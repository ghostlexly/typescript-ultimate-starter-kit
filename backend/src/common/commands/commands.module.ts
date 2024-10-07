import { Module } from "@nestjs/common";
import { SeedsModule } from "./seeds/seeds.module";
import { RedisClearCommandModule } from "./redis-clear/redis-clear.module";
import { CreateCustomerAccountCommandModule } from "./create-customer-account/create-customer-account.module";
import { CreateAdminAccountCommandModule } from "./create-admin-account/create-admin-account.module";

@Module({
  imports: [
    SeedsModule,
    CreateAdminAccountCommandModule,
    CreateCustomerAccountCommandModule,
    RedisClearCommandModule,
  ],
  providers: [],
})
export class CommandsModule {}
