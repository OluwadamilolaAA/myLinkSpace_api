import "dotenv/config";
import { resend } from "./src/lib/resend.js";

async function main() {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: "dammyadesh05@gmail.com",
    subject: "MyLinkSpace - Email Integration Test",
    html: `
      <h2>Welcome to MyLinkSpace!</h2>
      <p>Your Resend integration is working.</p>
      <p>You can now send password reset emails.</p>
    `,
  });

  if (error) {
    console.error("Email failed:", error);
    process.exitCode = 1;
    return;
  }

  console.log("Email accepted by Resend:", data);
}

main().catch(console.error);