import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CustomerListingCreateSchema = z.object({
  name: z.string().min(1),
});

export class CustomerListingCreateDto {
  @ApiProperty()
  name: string;
}
