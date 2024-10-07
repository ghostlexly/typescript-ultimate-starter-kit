import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UsePipes,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { DatabaseService } from "src/common/providers/database/database.service";
import {
  SubscriberPhoneUnlockDto,
  SubscriberPhoneUnlockSchema,
} from "../dtos/phone-unlock.dto";
import { SubscriberService } from "../subscriber.service";
import { IsPublic } from "src/common/decorators/is-public.decorator";

@ApiTags("Subscribers")
@Controller("/subscribers")
export class SubscriberController {
  constructor(
    private subscriberService: SubscriberService,
    private db: DatabaseService
  ) {}

  @Post("/:subscriberId/phone-unlock")
  @UsePipes(new ZodValidationPipe(SubscriberPhoneUnlockSchema))
  @IsPublic()
  async phoneUnlock(
    @Param("subscriberId") subscriberId: string,
    @Body() body: SubscriberPhoneUnlockDto
  ) {
    const data = await this.db.prisma.subscriber.findFirst({
      where: {
        id: subscriberId,
      },
    });

    if (!data) {
      throw new HttpException("Subscriber not found.", HttpStatus.NOT_FOUND);
    }

    // -- check if the phone number is the same as the one in the database
    if (data.phone !== body.phone) {
      throw new HttpException(
        "Ce numéro de téléphone est incorrect.",
        HttpStatus.BAD_REQUEST
      );
    }

    return data;
  }
}
