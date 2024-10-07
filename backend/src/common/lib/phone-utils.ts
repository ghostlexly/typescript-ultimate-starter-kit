import { HttpException, HttpStatus } from '@nestjs/common';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';

const parse = (params: { phoneNumber: string; countryCode?: CountryCode }) => {
  const { phoneNumber, countryCode = 'FR' } = params;

  const parsed = parsePhoneNumberFromString(phoneNumber, countryCode);

  if (!parsed || !parsed.isValid()) {
    throw new HttpException(
      'Numéro de téléphone invalide.',
      HttpStatus.BAD_REQUEST,
    );
  }

  return parsed;
};

const isValid = (params: {
  phoneNumber: string;
  countryCode?: CountryCode;
}) => {
  const { phoneNumber, countryCode = 'FR' } = params;

  const parsed = parsePhoneNumberFromString(phoneNumber, countryCode);

  if (!parsed || !parsed.isValid()) {
    return false;
  }

  return true;
};

export const phoneUtils = {
  parse,
  isValid,
};
