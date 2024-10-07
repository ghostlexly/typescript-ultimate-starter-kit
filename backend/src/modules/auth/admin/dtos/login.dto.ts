import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export class AdminLoginDTO {
  @ApiProperty({ example: "cs@dispomenage.fr" })
  email: string;

  @ApiProperty()
  password: string;
}
