import { Expose } from "class-transformer";

export class GetCustomerDTO {
  @Expose()
  id: any;

  @Expose()
  email: any;

  @Expose()
  urssafUserId: any;

  @Expose()
  mangopayUserId: any;

  @Expose()
  informations: any;

  @Expose()
  createdAt: any;

  @Expose()
  updatedAt: any;
}
