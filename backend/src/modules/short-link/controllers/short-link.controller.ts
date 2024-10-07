import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsPublic } from "src/common/decorators/is-public.decorator";
import { ShortLinkService } from "../short-link.service";
import { DatabaseService } from "src/common/providers/database/database.service";

@ApiTags("Short Links")
@Controller("/short-links")
@IsPublic()
export class ShortLinkController {
  constructor(
    private readonly shortLinkService: ShortLinkService,
    private readonly db: DatabaseService
  ) {}

  @Get("/:code")
  async getShortLink(@Param("code") code: string) {
    const shortLink = await this.db.prisma.shortLink.findFirst({
      where: {
        code: code,
      },
    });

    if (!shortLink) {
      throw new HttpException("Short link not found.", HttpStatus.NOT_FOUND);
    }

    return shortLink;
  }
}
