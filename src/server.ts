import "dotenv/config";
import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = Number(process.env.PORT) || 5000;

async function bootstrap() {
  try {
    await prisma.$connect();

    console.log("Database connected successfully");

    const server = app.listen(PORT, () => {
      console.log(
        `MyLinkSpace API running on http://localhost:${PORT}`
      );
    });

    async function shutdown() {
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start application:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();