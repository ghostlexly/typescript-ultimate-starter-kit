import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  AuthSession,
  AuthSessionInterface,
} from "src/common/decorators/auth-session.decorator";
@ApiTags("Me")
@ApiBearerAuth("access-token")
@Controller("/me")
export class MeController {
  @Get()
  async me(@AuthSession() session: AuthSessionInterface) {
    const { account } = session;

    if (account.role === "CUSTOMER") {
      return {
        id: account.customer.id,
        email: account.customer.email,
        role: account.role,
      };
    } else if (account.role === "ADMIN") {
      return {
        id: account.admin.id,
        email: account.admin.email,
        role: account.role,
      };
    } else {
      throw new HttpException("Invalid role.", HttpStatus.BAD_REQUEST);
    }
  }
}
