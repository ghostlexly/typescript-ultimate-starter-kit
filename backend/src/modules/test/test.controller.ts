import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsPublic } from "src/common/decorators/is-public.decorator";
import { TestService } from "./test.service";

@Controller("tests")
@ApiTags("Test")
export class TestController {
  constructor(private service: TestService) {}

  @Get()
  @IsPublic()
  async getTests() {
    this.service.invokeTests();

    return { message: "ok" };
  }
}
