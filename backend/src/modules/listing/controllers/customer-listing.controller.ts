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
import { Prisma } from "@prisma/client";
import { Roles } from "src/common/decorators/roles.decorator";
import { pageQuery } from "src/common/lib/page-query";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { DatabaseService } from "src/common/providers/database/database.service";
import {
  CustomerListingCreateDto,
  CustomerListingCreateSchema,
} from "../dtos/customer/create-listing.dto";
import { ListingService } from "../listing.service";
import {
  CustomerListingAttachSubscriberDto,
  CustomerListingAttachSubscriberSchema,
} from "../dtos/customer/attach-subscribers.dto";
import {
  AuthSession,
  AuthSessionInterface,
} from "src/common/decorators/auth-session.decorator";
import {
  CustomerListingUpdateDto,
  CustomerListingUpdateSchema,
} from "../dtos/customer/update-listing.dto";

@ApiTags("Listings")
@Controller("/customer/listings")
@ApiBearerAuth("access-token")
@Roles("CUSTOMER")
export class CustomerListingController {
  constructor(
    private listingService: ListingService,
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
  @ApiQuery({ name: "name", required: false }) // Filter
  async getListings(
    @AuthSession() session: AuthSessionInterface,
    @Req() req: Request,
    @Query("page") page: number,
    @Query("first") first = 50,
    @Query("include") includeQuery: string,
    @Query("sort") sort: string,
    @Query("name") name: string
  ) {
    const customer = session.account.customer;
    const pagination = pageQuery.getPagination({ page: page, first: first });
    const sorting = pageQuery.getSorting({ sort });
    const wAND: Prisma.ListingWhereInput[] = [];
    const include: Prisma.ListingInclude = {};
    let orderBy: Prisma.ListingOrderByWithRelationInput = {
      createdAt: "desc",
    };

    // ---------------------
    // Filters
    // ---------------------
    if (name) {
      wAND.push({
        name: {
          contains: name,
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
    const { data, count } = await this.db.prisma.listing.findManyAndCount({
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

  @Post()
  @UsePipes(new ZodValidationPipe(CustomerListingCreateSchema))
  async createListing(
    @AuthSession() session: AuthSessionInterface,
    @Body() body: CustomerListingCreateDto
  ) {
    const customer = session.account.customer;
    return await this.listingService.create({
      data: { ...body, customer: { connect: { id: customer.id } } },
    });
  }

  @Patch("/:id/attach-subscribers")
  @UsePipes(new ZodValidationPipe(CustomerListingAttachSubscriberSchema))
  async attachSubscribers(
    @Param("id") id: string,
    @Body() body: CustomerListingAttachSubscriberDto
  ) {
    return await this.db.prisma.listing.update({
      where: {
        id: id,
      },

      data: {
        subscribers: {
          connect: body.subscriberIds.map((id) => ({ id: id })),
        },
      },
    });
  }

  @Get("/:id")
  async getListing(
    @AuthSession() session: AuthSessionInterface,
    @Param("id") id: string
  ) {
    const customer = session.account.customer;

    const listing = await this.db.prisma.listing.findFirst({
      where: { id, customerId: customer.id },
    });

    if (!listing) {
      throw new HttpException("Can't find this listing.", HttpStatus.NOT_FOUND);
    }

    return listing;
  }

  @Patch("/:id")
  @UsePipes(new ZodValidationPipe(CustomerListingUpdateSchema))
  async updateListing(
    @AuthSession() session: AuthSessionInterface,
    @Param("id") id: string,
    @Body() body: CustomerListingUpdateDto
  ) {
    const customer = session.account.customer;

    const listing = await this.db.prisma.listing.findFirst({
      where: { id, customerId: customer.id },
    });

    if (!listing) {
      throw new HttpException("Can't find this listing.", HttpStatus.NOT_FOUND);
    }

    return await this.db.prisma.listing.update({
      where: { id, customerId: customer.id },
      data: body,
    });
  }

  @Delete("/:id")
  async deleteListing(
    @AuthSession() session: AuthSessionInterface,
    @Param("id") id: string
  ) {
    const customer = session.account.customer;

    const data = await this.db.prisma.listing.findFirst({
      where: { id, customerId: customer.id },
    });

    if (!data) {
      throw new HttpException("Can't find this listing.", HttpStatus.NOT_FOUND);
    }

    await this.db.prisma.listing.delete({
      where: { id, customerId: customer.id },
    });

    return data;
  }
}
