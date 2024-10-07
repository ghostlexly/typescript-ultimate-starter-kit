import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UsePipes,
} from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/common/decorators/roles.decorator";
import { SubscriberService } from "../subscriber.service";
import { DatabaseService } from "src/common/providers/database/database.service";
import { pageQuery } from "src/common/lib/page-query";
import { Prisma } from "@prisma/client";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import {
  CustomerSubscriberCreateDto,
  CustomerSubscriberCreateSchema,
} from "../dtos/customer/create-subscriber.dto";
import {
  CustomerSubscriberAttachListingsDto,
  CustomerSubscriberAttachListingsSchema,
} from "../dtos/customer/attach-listings.dto";
import {
  AuthSession,
  AuthSessionInterface,
} from "src/common/decorators/auth-session.decorator";
import {
  CustomerSubscriberUpdateDto,
  CustomerSubscriberUpdateSchema,
} from "../dtos/customer/update-subscriber.dto";

@ApiTags("Subscribers")
@Controller("/customer/subscribers")
@ApiBearerAuth("access-token")
@Roles("CUSTOMER")
export class CustomerSubscriberController {
  constructor(
    private subscriberService: SubscriberService,
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
  @ApiQuery({ name: "fullName", required: false }) // Filter
  @ApiQuery({ name: "phone", required: false }) // Filter
  async getSubscribers(
    @AuthSession() session: AuthSessionInterface,
    @Req() req: Request,
    @Query("page") page: number,
    @Query("first") first = 50,
    @Query("include") includeQuery: string,
    @Query("sort") sort: string,
    @Query("fullName") fullName: string,
    @Query("phone") phone: string
  ) {
    const customer = session.account.customer;

    const pagination = pageQuery.getPagination({ page: page, first: first });
    const sorting = pageQuery.getSorting({ sort });
    const wAND: Prisma.SubscriberWhereInput[] = [];
    const include: Prisma.SubscriberInclude = {};
    let orderBy: Prisma.SubscriberOrderByWithRelationInput = {
      createdAt: "desc",
    };

    // ---------------------
    // Filters
    // ---------------------
    if (fullName) {
      // Split the string by spaces and filter out empty strings
      const terms = fullName.split(" ").filter((term) => term.length > 0);

      terms.flatMap((term) => {
        wAND.push({
          OR: [
            {
              firstName: {
                contains: term,
              },
            },

            {
              lastName: {
                contains: term,
              },
            },
          ],
        });
      });
    }

    if (phone) {
      wAND.push({
        phone: {
          contains: phone,
        },
      });
    }

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
    const { data, count } = await this.db.prisma.subscriber.findManyAndCount({
      include: include,

      where: {
        AND: wAND,
        customerId: customer.id,
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

  @Get("/:id")
  async getSubscriber(
    @AuthSession() session: AuthSessionInterface,
    @Param("id") id: string
  ) {
    const customer = session.account.customer;

    return await this.db.prisma.subscriber.findFirst({
      include: {
        listings: true,
      },
      where: {
        id,
        customerId: customer.id,
      },
    });
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CustomerSubscriberCreateSchema))
  async createSubscriber(
    @AuthSession() session: AuthSessionInterface,
    @Body() body: CustomerSubscriberCreateDto
  ) {
    const customer = session.account.customer;

    return await this.subscriberService.create({
      data: {
        ...body,
        customer: {
          connect: {
            id: customer.id,
          },
        },
      },
    });
  }

  @Patch("/:id/attach-listings")
  @UsePipes(new ZodValidationPipe(CustomerSubscriberAttachListingsSchema))
  async attachListings(
    @Param("id") id: string,
    @Body() body: CustomerSubscriberAttachListingsDto
  ) {
    return await this.db.prisma.subscriber.update({
      where: { id },
      data: {
        listings: {
          set: body.listingIds.map((id) => ({ id: id })),
        },
      },
    });
  }

  @Patch("/:id")
  @UsePipes(new ZodValidationPipe(CustomerSubscriberUpdateSchema))
  async updateSubscriber(
    @AuthSession() session: AuthSessionInterface,
    @Param("id") id: string,
    @Body() body: CustomerSubscriberUpdateDto
  ) {
    const customer = session.account.customer;

    const subscriber = await this.db.prisma.subscriber.findFirst({
      where: { id, customerId: customer.id },
    });

    if (!subscriber) {
      throw new HttpException("Subscriber not found.", HttpStatus.NOT_FOUND);
    }

    return await this.db.prisma.subscriber.update({
      where: { id, customerId: customer.id },
      data: body,
    });
  }

  @Delete("/:id")
  async deleteSubscriber(
    @AuthSession() session: AuthSessionInterface,
    @Param("id") id: string
  ) {
    const customer = session.account.customer;

    return await this.db.prisma.subscriber.delete({
      where: { id, customerId: customer.id },
    });
  }
}
