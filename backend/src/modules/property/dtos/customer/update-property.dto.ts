import { ApiProperty } from "@nestjs/swagger";
import { PropertyStatus } from "@prisma/client";
import { z } from "zod";

export const CustomerPropertyUpdateSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1),
    rooms: z.coerce.number().min(1),
    squareMeters: z.coerce.number().min(1),
    address: z.string().min(1),
    price: z.coerce.number().min(1),
    estimatedWorkPrice: z.coerce.number().min(0),
    freeToRent: z.coerce.boolean(),
    coOwnershipCharges: z.coerce.number().min(0),
    landTax: z.coerce.number().min(0),
    status: z.nativeEnum(PropertyStatus),
    photos: z
      .array(z.string({ message: "Ce fichier est obligatoire." }).uuid())
      .min(1)
      .max(20),
    documents: z
      .array(z.string({ message: "Ce fichier est obligatoire." }).uuid())
      .max(20)
      .nullable(),
    video: z.string().uuid().nullable(),
  })
  .partial();

export class CustomerPropertyUpdateDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  rooms: number;

  @ApiProperty()
  squareMeters: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  estimatedWorkPrice: number;

  @ApiProperty()
  freeToRent: boolean;

  @ApiProperty()
  coOwnershipCharges: number;

  @ApiProperty()
  landTax: number;

  @ApiProperty({
    enum: PropertyStatus,
  })
  status: PropertyStatus;

  @ApiProperty()
  photos: string[];

  @ApiProperty()
  documents: string[];

  @ApiProperty()
  video: string;
}
