import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const AdminSmsNotificationCreateSchema = z.object({
  content: z.string().min(1).max(320),
  propertyId: z.string().uuid(),
  listingId: z.string().uuid(),
});

export class AdminSmsNotificationCreateDto {
  @ApiProperty({
    description:
      "The content of the SMS notification. Must be between 1 and 320 characters, for better deliverability.",
  })
  content: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  listingId: string;
}
