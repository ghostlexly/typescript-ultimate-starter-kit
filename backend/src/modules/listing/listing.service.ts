import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DatabaseService } from "src/common/providers/database/database.service";

@Injectable()
export class ListingService {
  constructor(private db: DatabaseService) {}

  async create({ data }: { data: Prisma.ListingCreateInput }) {
    return await this.db.prisma.listing.create({ data });
  }
}
