import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { wolfios } from "src/common/lib/wolfios";

@Injectable()
export class BrevoService {
  private readonly apiKey: string =
    this.configService.getOrThrow("BREVO_API_KEY");

  constructor(private readonly configService: ConfigService) {}

  async sendEmailTemplate({
    toEmail,
    templateId,
    templateParams,
    subject,
  }: {
    toEmail: string;
    templateId: number;
    templateParams: Record<string, string>;
    subject: string;
  }) {
    const data = await wolfios.post("https://api.brevo.com/v3/smtp/email", {
      headers: {
        "api-key": this.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: {
        to: [{ email: toEmail, name: "Anonymous" }],
        templateId,
        params: templateParams,
        subject,
      },
    });

    return data;
  }

  /**
   * Send SMS
   *
   * @param sender - The sender of the SMS. Limited to 11 characters and only letters and numbers.
   * @param recipient - The recipient of the SMS (ex: 33612345678)
   * @param message - The message to send
   * @returns
   */
  async sendSms({
    sender = "Alexandre",
    recipient,
    content,
  }: {
    sender?: string;
    recipient: string;
    content: string;
  }) {
    // -- remove spaces and + signs from the recipient
    recipient = recipient.replace(/[\s+]/g, "");

    const data = await wolfios.post(
      "https://api.brevo.com/v3/transactionalSMS/sms",
      {
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data: {
          type: "transactional",
          unicodeEnabled: true, // allow special characters and emojis, cost a bit more
          sender,
          recipient,
          content,
        },
      }
    );

    return data;
  }
}
