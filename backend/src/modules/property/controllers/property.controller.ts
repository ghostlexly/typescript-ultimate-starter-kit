import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  Req,
} from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import { IsPublic } from "src/common/decorators/is-public.decorator";
import { pageQuery } from "src/common/lib/page-query";
import { DatabaseService } from "src/common/providers/database/database.service";
import { SubscriberService } from "src/modules/subscriber/subscriber.service";
import { PropertyService } from "../property.service";

@ApiTags("Properties")
@Controller("/properties")
@IsPublic()
export class PropertyController {
  constructor(
    private db: DatabaseService,
    private propertyService: PropertyService,
    private subscriberService: SubscriberService
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
  async getProperties(
    @Req() req: Request,
    @Query("page") page: number,
    @Query("first") first = 50,
    @Query("include") includeQuery: string,
    @Query("sort") sort: string,
    @Query("id") id: string
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

  @Get("/:id/custom")
  @ApiQuery({ name: "subscriberId", required: true })
  async getCustomProperty(
    @Param("id") id: string,
    @Query("subscriberId") subscriberId: string
  ) {
    const property = await this.db.prisma.property.findFirst({
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
        id: id,
      },
    });

    if (!property) {
      throw new HttpException("Property not found.", HttpStatus.NOT_FOUND);
    }

    // -- personalise property's description for this subscriber
    property.description = await this.subscriberService.personaliseText({
      subscriberId,
      text: property.description ?? "",
    });

    return property;
  }
}
