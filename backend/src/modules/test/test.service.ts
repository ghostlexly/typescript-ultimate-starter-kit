import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { DatabaseService } from "src/common/providers/database/database.service";

@Injectable()
export class TestService {
  constructor(
    private db: DatabaseService,
    @InjectQueue("test") private testQueue: Queue
  ) {}

  async invokeTests() {
    this.testQueue.add({ message: "Hello" });
  }
}
