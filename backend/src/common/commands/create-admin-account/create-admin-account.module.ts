import { Module } from "@nestjs/common";
import { CreateAdminAccountCommand } from "./create-admin-account.command";

@Module({
  imports: [],
  providers: [CreateAdminAccountCommand],
})
export class CreateAdminAccountCommandModule {}
