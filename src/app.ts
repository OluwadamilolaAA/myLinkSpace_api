import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes";
import { verifyRequestOrigin } from "./middlewares/csrf.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.use(cookieParser());
app.use(verifyRequestOrigin);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "MyLinkSpace API is running",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use(errorMiddleware)

export default app;