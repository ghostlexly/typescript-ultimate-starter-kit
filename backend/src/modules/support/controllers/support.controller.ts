import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { BrevoService } from "src/modules/brevo/brevo.service";
import {
  SupportSendEmailDTO,
  SupportSendEmailSchema,
} from "../dtos/send-email.dto";
import { IsPublic } from "src/common/decorators/is-public.decorator";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Support")
@Controller("support")
export class SupportController {
  constructor(private readonly brevoService: BrevoService) {}

  @Post("/contact/email")
  @IsPublic()
  @UsePipes(new ZodValidationPipe(SupportSendEmailSchema))
  async sendEmail(@Body() body: SupportSendEmailDTO) {
    await this.brevoService.sendEmailTemplate({
      toEmail: "ghostlexly@gmail.com",
      templateId: 1,
      templateParams: {
        email: body.email,
        subject: body.subject,
        message: body.message,
      },
      subject: `ChatKraken Support Request - ${body.email}`,
    });
  }
}
