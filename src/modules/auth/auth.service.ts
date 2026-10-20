import bcrypt from "bcrypt";

import { AuthRepository } from "./auth.repository.js";
import {
  generateSessionToken,
  hashSessionToken,
  getSessionExpiry,
} from "../../common/utils/session.js";
import {
  ForgotPasswordInput,
  LoginInput,
  LoginMetadata,
  RegisterInput,
  ResetPasswordInput,
} from "./auth.types.js";
import ConflictError from "../../common/errors/conflict-error.js";
import UnauthorizedError from "../../common/errors/unauthorized-error.js";
import { EmailService } from "../../common/service/email.service.js";
import {
  generatePasswordResetToken,
  getPasswordResetExpiry,
  hashPasswordResetToken,
} from "../../common/utils/password-reset.js";

export class AuthService {
  constructor(
    private readonly repository = new AuthRepository(),
    private readonly emailService = new EmailService(),
  ) {}

  async register(data: RegisterInput) {
    const existingUser = await this.repository.findUserByEmail(data.email);

    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    return this.repository.createUser({
      name: data.name,
      email: data.email,
      passwordHash,
    });
  }

  async login(data: LoginInput, metadata: LoginMetadata) {
    const user = await this.repository.findUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError("Invalid credential");
    }

    const validPassword = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );
    if (!validPassword) {
      throw new UnauthorizedError("Invalid credential");
    }

    const token = generateSessionToken();

    const session = await this.repository.createSession({
      userId: user.id,
      tokenHash: hashSessionToken(token),
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      expiresAt: getSessionExpiry(),
    });
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      sessionToken: token,
      expiresAt: session.expiresAt,
    };
  }

  async logout(sessionId: string) {
    await this.repository.deleteSession(sessionId);
  }

  async forgotPassword(data: ForgotPasswordInput): Promise<void> {
    const user = await this.repository.findUserByEmail(data.email);

    if (!user) {
      return;
    }

    // Prevent repeatedly issuing reset emails for
    // the same account within 60 seconds.
    const latest = await this.repository.findLatestResetToken(user.id);

    if (latest && Date.now() - latest.createdAt.getTime() < 60_000) {
      return;
    }

    const token = generatePasswordResetToken();

    const tokenHash = hashPasswordResetToken(token);

    await this.repository.replacePasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt: getPasswordResetExpiry(),
    });

    try {
      await this.emailService.sendPasswordResetEmail(user.email, token);
    } catch (error) {
      await this.repository
        .deletePasswordResetToken(tokenHash)
        .catch(() => undefined);

      console.error("Password reset email delivery failed");
    }
  }

  async resetPassword(data: ResetPasswordInput): Promise<void> {
    const passwordHash = await bcrypt.hash(data.newPassword, 12);

    const tokenHash = hashPasswordResetToken(data.token);

    const success = await this.repository.resetPassword({
      tokenHash,
      passwordHash,
    });

    if (!success) {
      throw new UnauthorizedError("Invalid or expired password reset token");
    }
  }

  async getSessions(userId: string, currentSessionId: string) {
    const sessions = await this.repository.findUserSessions(userId);

    return sessions.map((session) => ({
      ...session,
      isCurrent: session.id === currentSessionId,
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    const result = await this.repository.revokeUserSession(userId, sessionId);

    if (result.count === 0) {
      throw new UnauthorizedError("Session not found");
    }
  }

  async revokeOtherSessions(userId: string, currentSessionId: string) {
    return this.repository.revokeOtherSessions(userId, currentSessionId);
  }
}
