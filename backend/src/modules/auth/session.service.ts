import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { dateFns } from "src/common/lib/date-fns";
import { DatabaseService } from "src/common/providers/database/database.service";

@Injectable()
export class SessionService {
  constructor(private db: DatabaseService) {}

  async create({ accountId }) {
    // -- generate session token
    const session = await this.db.prisma.session.create({
      data: {
        expiresAt: dateFns.add(new Date(), { days: 7 }),
        sessionToken: crypto.randomUUID(),
        accountId: accountId,
      },
    });

    return session;
  }

  async delete({ where }: { where: Prisma.SessionWhereUniqueInput }) {
    await this.db.prisma.session.delete({
      where,
    });
  }

  async findByToken(token: string) {
    const session = await this.db.prisma.session.findUnique({
      include: {
        account: {
          include: {
            admin: true,
            customer: true,
          },
        },
      },
      where: {
        sessionToken: token,
      },
    });

    if (!session) {
      throw new HttpException(
        `Session #${token} not found.`,
        HttpStatus.FORBIDDEN
      );
    }

    return session;
  }

  async isExpired(token: string) {
    const session = await this.db.prisma.session.findFirst({
      where: {
        sessionToken: token,
      },
    });

    if (!session) {
      return false;
    }

    if (dateFns.isAfter(new Date(), session.expiresAt)) {
      await this.delete({
        where: {
          sessionToken: session.id,
        },
      });

      return true;
    }

    return false;
  }
}
