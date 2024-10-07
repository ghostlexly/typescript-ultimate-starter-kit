import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { wolfios } from "src/common/lib/wolfios";
import twilio from "twilio";

@Injectable()
export class TwilioService {
  private readonly TWILIO_ACCOUNT_SID: string =
    this.configService.getOrThrow("TWILIO_ACCOUNT_SID");

  private readonly TWILIO_AUTH_TOKEN: string =
    this.configService.getOrThrow("TWILIO_AUTH_TOKEN");

  private readonly TWILIO_PHONE_NUMBER: string = this.configService.getOrThrow(
    "TWILIO_PHONE_NUMBER"
  );

  private readonly client = twilio(
    this.TWILIO_ACCOUNT_SID,
    this.TWILIO_AUTH_TOKEN
  );

  constructor(private readonly configService: ConfigService) {}

  /**
   * Send SMS
   *
   * @param sender - The sender of the SMS. Limited to 11 characters and only letters and numbers.
   * @param recipient - The recipient of the SMS (ex: +33 6 12 34 56 78)
   * @param message - The message to send
   * @returns
   */
  async sendSms({
    recipient,
    content,
  }: {
    recipient: string;
    content: string;
  }) {
    const message = await this.client.messages.create({
      body: content,
      from: this.TWILIO_PHONE_NUMBER,
      to: recipient,
    });

    return message;
  }
}
