import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UsePipes,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import * as bcrypt from "bcryptjs";
import { IsPublic } from "src/common/decorators/is-public.decorator";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { DatabaseService } from "src/common/providers/database/database.service";
import { AdminLoginDTO, AdminLoginSchema } from "./dtos/login.dto";
import { SessionService } from "../session.service";

@ApiTags("Auth/Admin")
@Controller("/admin/auth")
export class AuthAdminController {
  constructor(
    private db: DatabaseService,
    private sessionService: SessionService
  ) {}

  @Post("/signin")
  @IsPublic()
  @Throttle({ default: { limit: 10, ttl: 1000 * 60 * 1 } })
  @UsePipes(new ZodValidationPipe(AdminLoginSchema))
  async login(@Body() body: AdminLoginDTO) {
    // -- verify if user exists
    const user = await this.db.prisma.admin
      .findFirstOrThrow({
        where: {
          email: body.email,
        },
      })
      .catch(() => {
        throw new HttpException(
          "The credentials you entered are invalid.",
          HttpStatus.BAD_REQUEST
        );
      });

    // -- hash given password and compare it to the stored hash
    const validPassword = await bcrypt.compare(body.password, user.password);
    if (!validPassword) {
      throw new HttpException(
        "The credentials you entered are invalid.",
        HttpStatus.BAD_REQUEST
      );
    }

    // -- generate session token
    const session = await this.sessionService.create({
      accountId: user.accountId,
    });

    return {
      access_token: session.sessionToken,
    };
  }
}
