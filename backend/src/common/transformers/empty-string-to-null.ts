import { z } from "zod";

export const emptyStringToNull = z
  .string()
  .transform((v) => (v === "" ? null : v));
