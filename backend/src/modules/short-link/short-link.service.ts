import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DatabaseService } from "src/common/providers/database/database.service";
import crypto from "crypto";

@Injectable()
export class ShortLinkService {
  constructor(private readonly db: DatabaseService) {}

  async create({ data }: { data: Omit<Prisma.ShortLinkCreateInput, "code"> }) {
    const code = await this.generateUniqueCode();

    const shortLink = await this.db.prisma.shortLink.create({
      data: {
        ...data,
        code,
      },
    });

    return shortLink;
  }

  /**
   * Generate a unique code for a short link.
   * The recommanded length is 12. Which has a collision rate of 1 in 281,474,976,710,656.
   * @param length - The length of the code to generate
   * @returns The unique code
   */
  async generateUniqueCode(length = 12) {
    // Obtenir le timestamp actuel en millisecondes
    const timestamp = new Date().getTime();

    // Générer un nombre aléatoire
    const randomNumber = Math.random();

    // Combiner le timestamp et le nombre aléatoire
    const data = `${timestamp}-${randomNumber}`;

    // Créer un hash SHA-256 de ces données
    const hash = crypto.createHash("sha256").update(data).digest("hex");

    // Prendre les premiers 'length' caractères du hash
    return hash.slice(0, length);
  }

  async generateViewLinkForProperty({ propertyId, customerId, subscriberId }) {
    const redirectPath = new URL(
      `https://leclub.terra-capital.fr/properties/${propertyId}`
    );
    redirectPath.searchParams.append("customerId", customerId);
    redirectPath.searchParams.append("subscriberId", subscriberId);

    const shortLink = await this.create({
      data: {
        url: redirectPath.toString(),
      },
    });

    return `https://leclub.terra-capital.fr/r/${shortLink.code}`;
  }
}
