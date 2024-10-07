import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Account, Admin, Customer, Session } from "@prisma/client";

export type AuthSessionInterface = Session & {
  account: Account & {
    admin: Admin;
    customer: Customer;
  };
};

export const AuthSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
