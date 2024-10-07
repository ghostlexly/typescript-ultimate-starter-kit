import { Expose } from "class-transformer";

export class GetCustomerDTO {
  @Expose()
  id: any;

  @Expose()
  phone: string;
}
