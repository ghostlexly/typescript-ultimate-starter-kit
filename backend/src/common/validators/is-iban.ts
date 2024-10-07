import { z } from "zod";
import * as iban from "iban";

const ibanRegex = /^([A-Z]{2})(\d{2})([A-Z\d]{1,30})$/;

export const isIBAN = z
  .string()
  .transform((v) => v.replace(/[ _]/g, "")) // Supprime les espaces et soulignements
  .pipe(
    z.string().regex(ibanRegex, { message: "Ce numéro d'IBAN est incorrect." }),
  )
  .pipe(
    z.string().refine((v) => iban.isValid(v), {
      message:
        "Ce numéro d'IBAN ne respecte pas le format du pays ou est invalide.",
    }),
  );
