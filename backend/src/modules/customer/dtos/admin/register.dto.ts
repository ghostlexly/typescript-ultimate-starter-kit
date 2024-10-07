import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CustomerRegisterAdminSchema = z.object({
  email: z.string().email(),
});

export class CustomerRegisterAdminDTO {
  @ApiProperty({
    description: "The email of the customer",
    example: "cs@dispomenage.fr",
  })
  email: string;
}
