import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import * as bcrypt from "bcryptjs";
import { IsPublic } from "src/common/decorators/is-public.decorator";
import { Serialize } from "src/common/interceptors/serialize.interceptor";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { DatabaseService } from "src/common/providers/database/database.service";
import { CustomerService } from "src/modules/customer/customer.service";
import { GetCustomerDTO } from "./dtos/get-customer.dto";
import { CustomerLoginDTO, CustomerLoginSchema } from "./dtos/login.dto";
import {
  CustomerRegisterDTO,
  CustomerRegisterSchema,
} from "./dtos/register.dto";
import { SessionService } from "../session.service";

@ApiTags("Auth/Customer")
@Controller("/customer/auth")
@IsPublic()
export class AuthCustomerController {
  private logger = new Logger(AuthCustomerController.name);

  constructor(
    private db: DatabaseService,
    private sessionService: SessionService,
    private customerService: CustomerService
  ) {}

  @Post("/signin")
  @Throttle({ default: { limit: 10, ttl: 1000 * 60 * 1 } })
  @UsePipes(new ZodValidationPipe(CustomerLoginSchema))
  async emailLogin(@Body() body: CustomerLoginDTO) {
    // -- verify if user exists
    const user = await this.db.prisma.customer
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

    if (!user.password) {
      throw new HttpException(
        "The credentials you entered are invalid.",
        HttpStatus.BAD_REQUEST
      );
    }

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

  @Post("/signup")
  @UsePipes(new ZodValidationPipe(CustomerRegisterSchema))
  @Serialize(GetCustomerDTO)
  async emailSignUp(@Body() body: CustomerRegisterDTO) {
    // -- hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const customer = await this.customerService.create({
      data: {
        ...body,
        password: hashedPassword,
      },
    });

    return customer;
  }

  /**
   * Redirect to Google Auth login page
   */
  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth() {
    this.logger.log("Customer has been redirected to the Google login page.");
  }

  /**
   * Handle Google Auth callback
   */
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() req, @Res() res) {
    // Handle the Google OAuth2 callback
    // You can create a JWT token here or set a session
    const googleUser = req.user;

    // -- verify if user exists
    let user = await this.db.prisma.customer.findFirst({
      where: {
        email: googleUser.email,
      },
    });

    if (!user) {
      // ----------------------
      // if user does not exist, create a new one
      // ----------------------
      user = await this.customerService.create({
        data: {
          email: googleUser.email,
        },
      });
    }

    // ----------------------
    // Generate session token
    // ----------------------
    const session = await this.sessionService.create({
      accountId: user.accountId,
    });

    // --------------------------------
    // After the token is created, redirect to the frontend with the token
    // so we can create a cookie in the frontend with the token
    // --------------------------------
    res.redirect(
      `https://chatkraken.com/workspace/oauth2/google/callback?token=${session.sessionToken}`
    );
  }
}
