import { z } from "zod";

const bicRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

export const isBIC = z
  .string()
  .transform((v) => v.replace(/[ _]/g, ""))

  .pipe(
    z.string().regex(bicRegex, { message: "Ce numéro BIC est incorrect." }),
  );
