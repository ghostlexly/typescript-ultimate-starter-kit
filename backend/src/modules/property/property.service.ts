import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DatabaseService } from "src/common/providers/database/database.service";

@Injectable()
export class PropertyService {
  constructor(private readonly db: DatabaseService) {}

  async create({ data }: { data: Prisma.PropertyCreateInput }) {
    const property = await this.db.prisma.property.create({
      data,
    });

    return property;
  }

  async delete({ where }: { where: Prisma.PropertyWhereUniqueInput }) {
    const property = await this.db.prisma.property.findFirst({
      where,
    });

    if (!property) {
      throw new HttpException("Property not found.", HttpStatus.NOT_FOUND);
    }

    // -- delete any sms notifications related to this property
    await this.db.prisma.smsNotification.deleteMany({
      where: {
        propertyId: property.id,
      },
    });

    await this.db.prisma.property.delete({
      where,
    });
  }
}
