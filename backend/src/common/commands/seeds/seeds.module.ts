import { Module } from "@nestjs/common";
import { CountriesCommand } from "./countries.command";

@Module({
  imports: [],
  providers: [CountriesCommand],
})
export class SeedsModule {}
