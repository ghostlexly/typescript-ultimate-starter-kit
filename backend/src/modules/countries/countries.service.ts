import { Injectable } from '@nestjs/common';
import * as countries from 'i18n-iso-countries';

@Injectable()
export class CountriesService {
  findMany() {
    const data = countries.getNames('fr');

    // return data as countryName and countryCode
    const transformed = Object.entries(data).map(
      ([countryCode, countryName]) => ({
        countryCode,
        countryName,
      }),
    );

    return transformed;
  }
}
