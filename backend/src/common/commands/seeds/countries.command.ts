import { Command, CommandRunner } from "nest-commander";
import { DatabaseService } from "src/common/providers/database/database.service";
import papaparse from "papaparse";
import { wolfios } from "src/common/lib/wolfios";
import { Logger } from "@nestjs/common";

type InseeRow = {
  COG: string;
  ACTUAL: string;
  CRPAY: string;
  ANI: string;
  LIBCOG: string;
  LIBENR: string;
  CODEISO2: string;
  CODEISO3: string;
  CODENUM3: string;
};

@Command({
  name: "seed:countries",
  description: "Seed countries.",
})
export class CountriesCommand extends CommandRunner {
  private logger = new Logger(CountriesCommand.name);
  private inseeData: InseeRow[];

  constructor(private db: DatabaseService) {
    super();
  }

  async run() {
    this.logger.debug("Seeding countries...");

    try {
      this.logger.debug("Receiving insee data...");
      this.inseeData = await this.getInseeData();

      this.logger.debug("Receiving geonames.org data...");
      const countries = await wolfios
        .get("http://api.geonames.org/countryInfoJSON", {
          params: {
            username: "ghostlexly",
            formatted: "true",
            style: "full",
            lang: "FR",
          },
        })
        .then(async (res) => await res.json())
        .then((data) => data.geonames);

      for (const country of countries) {
        // -------------------------------------
        // find the insee data
        // to get insee country code
        // -------------------------------------
        const insee = this.findInsee(country.countryCode);

        if (!insee) {
          this.logger.warn(`No insee data found for ${country.countryCode}`);
        }

        // -------------------------------------
        // insert
        // -------------------------------------
        await this.db.prisma.country.create({
          data: {
            countryName: country.countryName,
            inseeCode: insee?.COG || null,
            iso2Code: country.countryCode,
            iso3Code: country.isoAlpha3,
            num3Code: country.isoNumeric,
            population: Number(country.population),
            continent: country.continent,
            continentName: country.continentName,
            currencyCode: country.currencyCode,
          },
        });

        this.logger.debug(`Seed [${country.countryName}] successfully.`);
      }

      this.logger.debug(`Seeding finished successfully.`);
    } catch (error) {
      this.logger.error("Error importing data:", error);
    }
  }

  async getInseeData() {
    const response = await wolfios
      .get(
        "https://www.insee.fr/fr/statistiques/fichier/7766585/v_pays_territoire_2024.csv"
      )
      .then(async (res) => await res.text());

    // -- parse csv data
    const { data } = papaparse.parse<InseeRow>(response, {
      header: true,
      skipEmptyLines: true,
    });

    return data;
  }

  findInsee(iso2Code: string) {
    return this.inseeData.find((item) => item.CODEISO2 === iso2Code);
  }
}
