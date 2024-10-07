import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';

@Module({
  imports: [],
  providers: [CountriesService],
  controllers: [CountriesController],
  exports: [],
})
export class CountriesModule {}
