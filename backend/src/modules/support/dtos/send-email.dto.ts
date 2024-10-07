import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const SupportSendEmailSchema = z.object({
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export class SupportSendEmailDTO {
  @ApiProperty()
  email: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  message: string;
}
