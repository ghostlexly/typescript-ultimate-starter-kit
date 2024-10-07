import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CustomerSubscriberAttachListingsSchema = z.object({
  listingIds: z.array(z.string().uuid()),
});

export class CustomerSubscriberAttachListingsDto {
  @ApiProperty()
  listingIds: string[];
}
