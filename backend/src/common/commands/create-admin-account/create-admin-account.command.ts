import { Command, CommandRunner, Option } from "nest-commander";
import { DatabaseService } from "src/common/providers/database/database.service";
import * as bcrypt from "bcryptjs";
import { Logger } from "@nestjs/common";

interface CreateAdminAccountOptions {
  email: string;
  password: string;
}

@Command({
  name: "create:admin-account",
  description: "Create an admin account.",
})
export class CreateAdminAccountCommand extends CommandRunner {
  private logger = new Logger(CreateAdminAccountCommand.name);

  constructor(private db: DatabaseService) {
    super();
  }

  async run(passedParam: string[], options?: CreateAdminAccountOptions) {
    this.logger.debug("Seeding admin account...");

    if (!options?.email || !options?.password) {
      this.logger.debug("Email and password are required.");
      return;
    }

    const hashedPassword = await bcrypt.hash(options.password, 10);

    await this.db.prisma.admin.create({
      data: {
        email: options.email,
        password: hashedPassword,
        account: {
          create: {
            role: "ADMIN",
          },
        },
      },
    });

    this.logger.debug("Seeding finished successfully.");
  }

  @Option({
    flags: "-e, --email [email]",
    description: "Email for the admin account",
  })
  parseEmail(val: string): string {
    return val;
  }

  @Option({
    flags: "-p, --password [password]",
    description: "Password for the admin account",
  })
  parsePassword(val: string): string {
    return val;
  }
}
