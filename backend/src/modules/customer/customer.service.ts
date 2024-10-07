import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DatabaseService } from "src/common/providers/database/database.service";

@Injectable()
export class CustomerService {
  constructor(private db: DatabaseService) {}

  async update({
    where,
    data,
  }: {
    where: Prisma.CustomerWhereUniqueInput;
    data: Prisma.CustomerUpdateInput;
  }) {
    const current = await this.db.prisma.customer.findFirstOrThrow({
      where,
    });
    // const merged = { ...current, ...data };

    // -- verify if the e-mail is being changed
    // if so, we need to verify if the new e-mail is already in use by another user
    if (current.email !== data.email && data.email) {
      // verify if the new e-mail is already in use
      const isEmailAlreadyInUse = await this.verifyExistingEmail({
        email: data.email,
      });

      if (isEmailAlreadyInUse) {
        throw new HttpException(
          "This email address is already in use",
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const customer = await this.db.prisma.customer.update({
      data: data,
      where: where,
    });

    return customer;
  }

  async create(params: { data: Omit<Prisma.CustomerCreateInput, "account"> }) {
    const { data } = params;

    // -- verify if this e-mail is already in use
    const isEmailAlreadyInUse = await this.verifyExistingEmail({
      email: data.email,
    });

    if (isEmailAlreadyInUse) {
      throw new HttpException(
        "This email address is already in use",
        HttpStatus.BAD_REQUEST
      );
    }

    // -- create
    const customer = await this.db.prisma.customer.create({
      data: {
        ...data,
        account: {
          create: {
            role: "CUSTOMER",
          },
        },
      },
    });

    return customer;
  }

  /**
   * Verify if the given e-mail is already in use.
   */
  async verifyExistingEmail({ email }) {
    const existingCustomer = await this.db.prisma.customer.findUnique({
      where: {
        email: email,
      },
    });

    if (existingCustomer) {
      return true;
    }

    return false;
  }
}
