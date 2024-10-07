import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UsePipes,
} from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/common/decorators/roles.decorator";
import { DatabaseService } from "src/common/providers/database/database.service";
import { pageQuery } from "src/common/lib/page-query";
import { Prisma } from "@prisma/client";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { SmsNotificationService } from "../sms-notification.service";
import {
  AdminSmsNotificationCreateDto,
  AdminSmsNotificationCreateSchema,
} from "../dtos/admin/create-sms-notification.dto";
import {
  AuthSession,
  AuthSessionInterface,
} from "src/common/decorators/auth-session.decorator";

@ApiTags("SmsNotifications")
@Controller("/customer/sms-notifications")
@ApiBearerAuth("access-token")
@Roles("CUSTOMER")
export class CustomerSmsNotificationController {
  constructor(
    private smsNotificationService: SmsNotificationService,
    private db: DatabaseService
  ) {}

  @Get()
  @ApiQuery({ name: "page", required: false }) // Pagination
  @ApiQuery({ name: "first", required: false }) // Pagination
  @ApiQuery({
    name: "include",
    required: false,
  }) // Includes
  @ApiQuery({ name: "sort", required: false }) // Sorting
  async getSmsNotifications(
    @Req() req: Request,
    @Query("page") page: number,
    @Query("first") first = 50,
    @Query("include") includeQuery: string,
    @Query("sort") sort: string
  ) {
    const pagination = pageQuery.getPagination({ page: page, first: first });
    const sorting = pageQuery.getSorting({ sort });
    const wAND: Prisma.SmsNotificationWhereInput[] = [];
    const include: Prisma.SmsNotificationInclude = {};
    let orderBy: Prisma.SmsNotificationOrderByWithRelationInput = {
      createdAt: "desc",
    };

    // ---------------------
    // Filters
    // ---------------------

    // ---------------------
    // Includes
    // ---------------------

    // ---------------------
    // Sorting
    // ---------------------
    if (sorting?.column === "createdAt") {
      orderBy = {
        createdAt: sorting.direction,
      };
    }

    // ---------------------
    // Query
    // ---------------------
    const { data, count } =
      await this.db.prisma.smsNotification.findManyAndCount({
        include: include,

        where: {
          AND: wAND,
        },

        orderBy,
        ...pagination,
      });

    return pageQuery.getTransformed({
      data,
      first,
      page,
      itemsCount: count,
    });
  }

  @Post()
  @UsePipes(new ZodValidationPipe(AdminSmsNotificationCreateSchema))
  async createSmsNotification(
    @AuthSession() session: AuthSessionInterface,
    @Body() body: AdminSmsNotificationCreateDto
  ) {
    const customer = session.account.customer;

    const smsNotification = await this.smsNotificationService.create({
      data: {
        content: body.content,
        property: {
          connect: {
            id: body.propertyId,
          },
        },
        listing: {
          connect: { id: body.listingId },
        },
        customer: {
          connect: {
            id: customer.id,
          },
        },
      },
    });

    await this.smsNotificationService.process({
      smsNotificationId: smsNotification.id,
    });

    return smsNotification;
  }
}
