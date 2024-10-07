import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Serialize } from "src/common/interceptors/serialize.interceptor";
import { DatabaseService } from "src/common/providers/database/database.service";
import { CustomerService } from "../customer.service";
import { GetCustomerDTO } from "../dtos/get-customer.dto";
import { IsPublic } from "src/common/decorators/is-public.decorator";

@ApiTags("Customer")
@Controller("/customers")
export class CustomerController {
  constructor(
    private customerService: CustomerService,
    private db: DatabaseService
  ) {}

  @Get("/:customerId")
  @Serialize(GetCustomerDTO)
  @IsPublic()
  async getCustomer(@Param("customerId") customerId: string) {
    const customer = await this.db.prisma.customer.findFirst({
      where: {
        id: customerId,
      },
    });

    return customer ?? {};
  }
}
