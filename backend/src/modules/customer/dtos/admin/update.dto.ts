import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CustomerUpdateAdminSchema = z.object({
  email: z.string().email(),
});

export class CustomerUpdateAdminDTO {
  @ApiProperty()
  email: string;
}
