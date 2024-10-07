import { ApiProperty } from "@nestjs/swagger";
import { phoneUtils } from "src/common/lib/phone-utils";
import { isValidPhoneNumber } from "src/common/validators/is-valid-phone-number";
import { z } from "zod";

export const SubscriberPhoneUnlockSchema = z.object({
  phone: z
    .string()
    .pipe(isValidPhoneNumber)
    .transform((value) =>
      phoneUtils.parse({ phoneNumber: value }).formatInternational()
    ),
});

export class SubscriberPhoneUnlockDto {
  @ApiProperty()
  phone: string;
}
