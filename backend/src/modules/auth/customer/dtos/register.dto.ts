import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CustomerRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export class CustomerRegisterDTO {
  @ApiProperty({
    description: "The email of the customer",
    example: "cs@dispomenage.fr",
  })
  email: string;

  @ApiProperty({
    description: "The password of the customer",
    example: "password",
  })
  password: string;
}
