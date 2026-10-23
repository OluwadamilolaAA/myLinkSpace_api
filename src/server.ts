import "dotenv/config";

import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = Number(process.env.PORT) || 5000;

async function bootstrap() {
  try {
    // Establish database connection
    await prisma.$connect();

    console.log("Database connected successfully");

    // Start the HTTP server
    const server = app.listen(PORT, () => {
      console.log(`MyLinkSpace API running on http://localhost:${PORT}`);
    });

    // Gracefully stop the application
    async function shutdown(signal: string) {
      console.log(`${signal} received. Shutting down...`);

      server.close(async (error) => {
        try {
          await prisma.$disconnect();

          if (error) {
            console.error("HTTP server shutdown error:", error);
            process.exitCode = 1;
          } else {
            console.log("Application shut down successfully");
            process.exitCode = 0;
          }
        } catch (disconnectError) {
          console.error("Database disconnection failed:", disconnectError);

          process.exitCode = 1;
        }
      });
    }

    process.once("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.once("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    console.error("Failed to start application:", error);

    await prisma.$disconnect().catch((disconnectError) => {
      console.error("Database disconnection failed:", disconnectError);
    });

    process.exitCode = 1;
  }
}

void bootstrap();
