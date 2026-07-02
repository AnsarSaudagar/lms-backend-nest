import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;

  constructor(config: ConfigService) {
    const user = config.getOrThrow<string>('GMAIL_USER');

    this.from = `"LMS Platform" <${user}>`;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass: config.getOrThrow<string>('GMAIL_APP_PASSWORD'),
      },
    });
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    await this.send({
      to,
      subject: 'Your verification code',
      html: `
        <p>Use the code below to verify your email address. It expires in <strong>5 minutes</strong>.</p>
        <h2 style="letter-spacing:4px">${otp}</h2>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    });
  }

  private async send(options: { to: string; subject: string; html: string }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        ...options,
      });
    } catch (err) {
      this.logger.error(`Failed to send email to ${options.to}`, err);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
