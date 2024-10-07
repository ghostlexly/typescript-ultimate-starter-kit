import { z } from "zod";
import { phoneUtils } from "../lib/phone-utils";

export const isValidPhoneNumber = z.string().refine((value) => {
  return phoneUtils.isValid({ phoneNumber: value });
}, "Ce numéro de téléphone est invalide.");
