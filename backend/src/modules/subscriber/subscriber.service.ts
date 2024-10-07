import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DatabaseService } from "src/common/providers/database/database.service";

@Injectable()
export class SubscriberService {
  constructor(private db: DatabaseService) {}

  async create({ data }: { data: Prisma.SubscriberCreateInput }) {
    return await this.db.prisma.subscriber.create({ data });
  }

  async personaliseText({
    subscriberId,
    text,
  }: {
    subscriberId: string;
    text: string;
  }) {
    const subscriber = await this.db.prisma.subscriber.findFirst({
      where: {
        id: subscriberId,
      },
    });

    if (!subscriber) {
      throw new HttpException("Subscriber not found.", HttpStatus.NOT_FOUND);
    }

    text = text.replace(/{firstName}/g, subscriber.firstName);
    text = text.replace(/{lastName}/g, subscriber.lastName);

    return text;
  }
}
