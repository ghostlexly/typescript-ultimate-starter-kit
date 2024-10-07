import { ApiProperty } from "@nestjs/swagger";
import { phoneUtils } from "src/common/lib/phone-utils";
import { isValidPhoneNumber } from "src/common/validators/is-valid-phone-number";
import { z } from "zod";

export const CustomerSubscriberUpdateSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z
      .string()
      .pipe(isValidPhoneNumber)
      .transform((value) =>
        phoneUtils.parse({ phoneNumber: value }).formatInternational()
      ),
    email: z.string().email().nullable(),
  })
  .partial();

export class CustomerSubscriberUpdateDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;
}
