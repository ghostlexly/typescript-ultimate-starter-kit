import {
  PipeTransform,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ZodSchema, z } from "zod";
import * as i18next from "i18next";
import { zodI18nMap } from "zod-i18n-map";
import transZodFr from "../locales/zod/fr.json";

/**
 * Initialize i18next
 */
// i18next.init({
//   lng: "fr",
//   resources: {
//     fr: { zod: transZodFr },
//   },
// });

// z.setErrorMap(zodI18nMap);

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      // --------------------------------------------------
      // If the metadata type is not 'body', simply return the value without validation.
      // We only want to validate the body of the request, not the query parameters or the params.
      // --------------------------------------------------
      if (metadata.type !== "body") {
        return value;
      }

      // --------------------------------------------------
      // Parse the value with the schema to validate it.
      // If the value is is valid, return the parsed value.
      // ------------------------------------------------
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (zodError) {
      // --------------------------------------------------
      // If the value is invalid, throw an HttpException with the error message.
      // --------------------------------------------------
      throw new HttpException(
        {
          message: `The form contains ${
            Object.values(zodError.errors).length
          } error(s). \n Please correct them to proceed.`,
          violations: zodError.errors.map((e) => ({
            code: e.code,
            message: e.message,
            path: e.path.join("."),
          })),
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
