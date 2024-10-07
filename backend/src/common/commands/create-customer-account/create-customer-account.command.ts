import { Command, CommandRunner, Option } from "nest-commander";
import { DatabaseService } from "src/common/providers/database/database.service";
import * as bcrypt from "bcryptjs";
import { Logger } from "@nestjs/common";

interface CreateCustomerAccountOptions {
  email: string;
  password: string;
}

@Command({
  name: "create:customer-account",
  description: "Create a customer account.",
})
export class CreateCustomerAccountCommand extends CommandRunner {
  private logger = new Logger(CreateCustomerAccountCommand.name);

  constructor(private db: DatabaseService) {
    super();
  }

  async run(passedParam: string[], options?: CreateCustomerAccountOptions) {
    this.logger.debug("Seeding customer account...");

    if (!options?.email || !options?.password) {
      this.logger.debug("Email and password are required.");
      return;
    }

    const hashedPassword = await bcrypt.hash(options.password, 10);

    await this.db.prisma.customer.create({
      data: {
        email: options.email,
        password: hashedPassword,
        account: {
          create: {
            role: "CUSTOMER",
          },
        },
      },
    });

    this.logger.debug("Seeding finished successfully.");
  }

  @Option({
    flags: "-e, --email [email]",
    description: "Email for the customer account",
  })
  parseEmail(val: string): string {
    return val;
  }

  @Option({
    flags: "-p, --password [password]",
    description: "Password for the customer account",
  })
  parsePassword(val: string): string {
    return val;
  }
}
