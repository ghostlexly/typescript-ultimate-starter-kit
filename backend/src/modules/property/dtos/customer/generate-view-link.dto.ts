import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CustomerPropertyGenerateViewLinkSchema = z.object({
  subscriberId: z.string().uuid(),
});

export class CustomerPropertyGenerateViewLinkDto {
  @ApiProperty()
  subscriberId: string;
}
