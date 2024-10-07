// import { Logger } from "@nestjs/common";
// import { Command, CommandRunner } from "nest-commander";
// import papaparse from "papaparse";
// import { wolfios } from "src/common/lib/wolfios";
// import { DatabaseService } from "src/common/providers/database/database.service";

// @Command({
//   name: "seed:postal-codes",
//   description: "Seed French postal codes.",
// })
// export class PostalCodesCommand extends CommandRunner {
//   private logger = new Logger(PostalCodesCommand.name);
//   private inseeData: any;

//   constructor(private db: DatabaseService) {
//     super();
//   }

//   async run() {
//     this.logger.debug("Getting insee postal code data...");
//     this.inseeData = await this.getInseeData();

//     this.logger.debug("Seeding postal codes...");

//     try {
//       const response = await wolfios
//         .get(
//           "https://datanova.laposte.fr/data-fair/api/v1/datasets/laposte-hexasmal/data-files/019HexaSmal.csv"
//         )
//         .then((res) => res.data);

//       // -- parse csv data
//       const parsed = papaparse.parse(response, {
//         header: true,
//         // delimiter: ";",
//         skipEmptyLines: true,
//       });

//       // -- map the data to the correct format
//       const data = parsed.data.map((record: any) => {
//         return {
//           code_commune_INSEE: record["#Code_commune_INSEE"],
//           nom_de_la_commune: record["Nom_de_la_commune"],
//           code_postal: record["Code_postal"],
//           libelle_d_acheminement: record["Libell�_d_acheminement"],
//           ligne_5: record["Ligne_5"],
//         };
//       });

//       for (const record of data) {
//         // -- check if the record has a line 5, if so, skip it
//         if (record.ligne_5) {
//           continue;
//         }

//         // -------------------------------------
//         // find the insee data
//         // to get more informations like population, department, region, cantonCode, arrondCode, departmentCode, gps coordinates ...
//         // -------------------------------------
//         const inseeData = this.findInsee(record.code_commune_INSEE);

//         if (!inseeData) {
//           this.logger.warn(
//             `No insee data found for ${record.code_commune_INSEE} - ${record.nom_de_la_commune}`
//           );
//           continue;
//         }

//         // -------------------------------------
//         // insert
//         // -------------------------------------
//         await this.db.prisma.postalCode.create({
//           data: {
//             inseeCode: record.code_commune_INSEE,
//             city: record.libelle_d_acheminement,
//             postalCode: record.code_postal,

//             // 👇 complete with insee data
//             population: Math.round(inseeData.population * 1000),
//             department: inseeData.nom_dept.join(", "), // assuming array needs to be joined to string
//             region: inseeData.nom_region.join(", "), // assuming array needs to be joined to string
//             gpsLatitude: inseeData.geo_point_2d.lat,
//             gpsLongitude: inseeData.geo_point_2d.lon,
//             departmentCode: inseeData.code_dept,
//             regionCode: inseeData.code_reg,
//             arrondCode: inseeData.code_arr,
//             cantonCode: inseeData.code_cant,
//           },
//         });
//       }

//       this.logger.debug(`Seeding finished successfully.`);
//     } catch (error) {
//       this.logger.error("Error importing data:", error);
//     }
//   }

//   findInsee(inseeCode: string) {
//     return this.inseeData.find((item: any) => item.insee_com === inseeCode);
//   }

//   async getInseeData() {
//     const data = await wolfios
//       .get(
//         "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/correspondance-code-insee-code-postal/exports/json?lang=fr&timezone=Europe%2FBerlin"
//       )
//       .then((res) => res.data);

//     return data;
//   }
// }
