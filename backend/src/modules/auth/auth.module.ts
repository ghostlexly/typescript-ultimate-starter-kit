import { Module } from "@nestjs/common";
import { AuthCustomerController } from "./customer/auth-customer.controller";
import { AuthAdminController } from "./admin/auth-admin.controller";
import { CustomerModule } from "../customer/customer.module";
import { GoogleStrategy } from "./strategies/google.strategy";
import { SessionService } from "./session.service";
import { BearerStrategy } from "./strategies/bearer.strategy";

@Module({
  imports: [CustomerModule],
  providers: [SessionService, BearerStrategy, GoogleStrategy],
  controllers: [AuthCustomerController, AuthAdminController],
  exports: [],
})
export class AuthModule {}
