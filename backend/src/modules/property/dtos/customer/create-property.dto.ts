import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CustomerPropertyCreateSchema = z.object({
  name: z.string().min(1),
});

export class CustomerPropertyCreateDto {
  @ApiProperty()
  name: string;
}
