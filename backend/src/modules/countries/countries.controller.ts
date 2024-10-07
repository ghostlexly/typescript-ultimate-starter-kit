import { Controller, Get } from "@nestjs/common";
import { CountriesService } from "./countries.service";
import { ApiTags } from "@nestjs/swagger";
import { IsPublic } from "src/common/decorators/is-public.decorator";

@ApiTags("Countries")
@Controller("/countries")
export class CountriesController {
  constructor(private countriesService: CountriesService) {}

  @Get()
  @IsPublic()
  async countries() {
    return this.countriesService.findMany();
  }
}
