import { resend } from "../../lib/resend";

export class EmailService {
  async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<void> {
    const from = process.env.EMAIL_FROM;
    const clientOrigin = process.env.CLIENT_ORIGIN;

    if (!from || !clientOrigin) {
      throw new Error("Email configuration is incomplete");
    }

    const resetUrl = new URL(
      "/reset-password",
      clientOrigin
    );

    resetUrl.searchParams.set("token", resetToken);

    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: "Reset your MyLinkSpace password",
      text: [
        "We received a request to reset your password.",
        "",
        `Reset your password: ${resetUrl.toString()}`,
        "",
        "This link expires in 15 minutes.",
        "If you didn't request this, ignore this email.",
      ].join("\n"),
    });

    if (error) {
      throw new Error("Password reset email could not be sent");
    }
  }
}