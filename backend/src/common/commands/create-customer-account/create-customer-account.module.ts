import { Module } from "@nestjs/common";
import { CreateCustomerAccountCommand } from "./create-customer-account.command";

@Module({
  imports: [],
  providers: [CreateCustomerAccountCommand],
})
export class CreateCustomerAccountCommandModule {}
