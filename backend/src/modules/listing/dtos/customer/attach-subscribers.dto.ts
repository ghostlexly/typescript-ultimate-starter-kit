import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CustomerListingAttachSubscriberSchema = z.object({
  subscriberIds: z.array(z.string().uuid()).min(1),
});

export class CustomerListingAttachSubscriberDto {
  @ApiProperty()
  subscriberIds: string[];
}
