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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "src/common/decorators/roles.decorator";
import { DatabaseService } from "src/common/providers/database/database.service";
import { PropertyService } from "../property.service";
import { pageQuery } from "src/common/lib/page-query";
import { Prisma } from "@prisma/client";
import {
  CustomerPropertyCreateDto,
  CustomerPropertyCreateSchema,
} from "../dtos/customer/create-property.dto";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import {
  CustomerPropertyUpdateDto,
  CustomerPropertyUpdateSchema,
} from "../dtos/customer/update-property.dto";
import {
  AuthSession,
  AuthSessionInterface,
} from "src/common/decorators/auth-session.decorator";
import { ShortLinkService } from "src/modules/short-link/short-link.service";
import {
  CustomerPropertyGenerateViewLinkDto,
  CustomerPropertyGenerateViewLinkSchema,
} from "../dtos/customer/generate-view-link.dto";

@ApiTags("Properties")
@Controller("/customer/properties")
@ApiBearerAuth("access-token")
@Roles("CUSTOMER")
export class CustomerPropertyController {
  constructor(
    private db: DatabaseService,
    private propertyService: PropertyService,
    private shortLinkService: ShortLinkService
  ) {}

  @Get()
  @ApiQuery({ name: "page", required: false }) // Pagination
  @ApiQuery({ name: "first", required: false }) // Pagination
  @ApiQuery({
    name: "include",
    required: false,
  }) // Includes
  @ApiQuery({ name: "sort", required: false }) // Sorting
  @ApiQuery({ name: "id", required: false }) // Filter
  @ApiQuery({ name: "name", required: false }) // Filter
  @ApiQuery({ name: "address", required: false }) // Filter
  @ApiQuery({ name: "price", required: false }) // Filter
  async getProperties(
    @Req() req: Request,
    @Query("page") page: number,
    @Query("first") first = 50,
    @Query("include") includeQuery: string,
    @Query("sort") sort: string,
    @Query("id") id: string,
    @Query("name") name: string,
    @Query("address") address: string,
    @Query("price") price: string
  ) {
    const pagination = pageQuery.getPagination({ page: page, first: first });
    const sorting = pageQuery.getSorting({ sort });
    const wAND: Prisma.PropertyWhereInput[] = [];
    let orderBy: Prisma.PropertyOrderByWithRelationInput = {
      createdAt: "desc",
    };

    // ---------------------
    // Filters
    // ---------------------
    if (id) {
      wAND.push({
        id: {
          equals: id,
        },
      });
    }

    if (name) {
      wAND.push({
        name: {
          contains: name,
        },
      });
    }

    if (address) {
      wAND.push({
        address: {
          contains: address,
        },
      });
    }

    if (price) {
      wAND.push({
        price: {
          equals: parseFloat(price),
        },
      });
    }

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
    const { data, count } = await this.db.prisma.property.findManyAndCount({
      include: {
        photos: {
          select: {
            id: true,
            fileName: true,
            fileKey: true,
            mimeType: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },

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

  @Get("/:id")
  async getPropertyById(@Param("id") id: string) {
    const property = await this.db.prisma.property.findUnique({
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
        photos: {
          select: {
            id: true,
            fileName: true,
            fileKey: true,
            mimeType: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        documents: {
          select: {
            id: true,
            fileName: true,
            fileKey: true,
            mimeType: true,
          },
        },
        video: {
          select: {
            id: true,
            fileName: true,
            fileKey: true,
            mimeType: true,
          },
        },
      },
      where: {
        id,
      },
    });

    if (!property) {
      throw new HttpException("Property not found.", HttpStatus.NOT_FOUND);
    }

    return property;
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CustomerPropertyCreateSchema))
  async createProperty(
    @AuthSession() session: AuthSessionInterface,
    @Body() body: CustomerPropertyCreateDto
  ) {
    const customer = session.account.customer;

    const data = await this.propertyService.create({
      data: {
        ...body,
        createdBy: {
          connect: {
            id: customer.id,
          },
        },
      },
    });

    return data;
  }

  @Patch("/:id")
  @UsePipes(new ZodValidationPipe(CustomerPropertyUpdateSchema))
  async updateProperty(
    @Param("id") id: string,
    @Body() body: CustomerPropertyUpdateDto
  ) {
    const data = await this.db.prisma.property.update({
      where: {
        id,
      },
      data: {
        ...body,

        photos: {
          set: body.photos.map((photo) => ({
            id: photo,
          })),
        },

        documents: body.documents
          ? {
              set: body.documents.map((document) => ({
                id: document,
              })),
            }
          : {
              set: [],
            },

        video: body.video
          ? {
              connect: {
                id: body.video,
              },
            }
          : {
              disconnect: true,
            },
      },
    });

    return data;
  }

  @Delete("/:id")
  async deleteProperty(@Param("id") id: string) {
    const property = await this.db.prisma.property.findFirst({
      where: {
        id: id,
      },
    });

    if (!property) {
      throw new HttpException("Property not found.", HttpStatus.NOT_FOUND);
    }

    await this.propertyService.delete({
      where: {
        id,
      },
    });

    return property;
  }

  @Post("/:id/view-link")
  @ApiOperation({
    summary: "Generate a view link for a property to view it as a subscriber.",
  })
  @UsePipes(new ZodValidationPipe(CustomerPropertyGenerateViewLinkSchema))
  async generateViewLink(
    @AuthSession() session: AuthSessionInterface,
    @Param("id") id: string,
    @Body() body: CustomerPropertyGenerateViewLinkDto
  ) {
    const customer = session.account.customer;

    const property = await this.db.prisma.property.findFirst({
      where: {
        id,
      },
    });

    if (!property) {
      throw new HttpException("Property not found.", HttpStatus.NOT_FOUND);
    }

    const shortLinkUrl =
      await this.shortLinkService.generateViewLinkForProperty({
        propertyId: property.id,
        customerId: customer.id,
        subscriberId: body.subscriberId,
      });

    return {
      shortLinkUrl,
    };
  }
}
