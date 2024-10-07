import { Module } from "@nestjs/common";
import { TestController } from "./test.controller";
import { BullModule } from "@nestjs/bull";
import { join } from "path";
import { TestService } from "./test.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "test",
      processors: [join(__dirname, "test.processor.js")],
    }),
  ],
  providers: [TestService],
  controllers: [TestController],
  exports: [
    BullModule, // (optional) export BullModule to be able to call InjectQueue("test") in other modules if needed (you still need to import MediaModule on other modules)
  ],
})
export class TestModule {}
