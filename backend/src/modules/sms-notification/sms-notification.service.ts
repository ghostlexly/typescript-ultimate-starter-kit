import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Queue } from "bull";
import { DatabaseService } from "src/common/providers/database/database.service";

@Injectable()
export class SmsNotificationService {
  constructor(
    private db: DatabaseService,
    @InjectQueue("SmsSendingQueue") private smsSendingQueue: Queue
  ) {}

  async create({ data }: { data: Prisma.SmsNotificationCreateInput }) {
    return await this.db.prisma.smsNotification.create({ data });
  }

  async process({ smsNotificationId }: { smsNotificationId: string }) {
    await this.smsSendingQueue.add({ smsNotificationId });
  }
}
