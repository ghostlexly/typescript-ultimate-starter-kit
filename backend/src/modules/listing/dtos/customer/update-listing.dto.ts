import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CustomerListingUpdateSchema = z
  .object({
    name: z.string().min(1),
  })
  .partial();

export class CustomerListingUpdateDto {
  @ApiProperty()
  name: string;
}
