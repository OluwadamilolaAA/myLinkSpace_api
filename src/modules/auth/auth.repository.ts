import { prisma } from "../../lib/prisma";
import { Prisma } from "../../../generated/prisma/client.js";

export class AuthRepository {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  createUser(data: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  }

  createSession(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.session.create({
      data,
    });
  }

  findSessionByTokenHash(tokenHash: string) {
    return prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  deleteSession(id: string) {
    return prisma.session.deleteMany({
      where: { id },
    });
  }

  findLatestResetToken(userId: string) {
    return prisma.passwordResetToken.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
  }

  replacePasswordResetToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.$transaction(
      async (tx) => {
        await tx.passwordResetToken.deleteMany({
          where: { userId: data.userId },
        });

        return tx.passwordResetToken.create({
          data,
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  deletePasswordResetToken(tokenHash: string) {
    return prisma.passwordResetToken.deleteMany({
      where: { tokenHash },
    });
  }

  resetPassword(data: {
  tokenHash: string;
  passwordHash: string;
}) {
  return prisma.$transaction(
    async (tx) => {
      const resetToken =
        await tx.passwordResetToken.findUnique({
          where: { tokenHash: data.tokenHash },
        });

      if (
        !resetToken ||
        resetToken.expiresAt <= new Date()
      ) {
        return false;
      }

      const claimed =
        await tx.passwordResetToken.deleteMany({
          where: {
            id: resetToken.id,
            expiresAt: { gt: new Date() },
          },
        });

      if (claimed.count !== 1) {
        return false;
      }

      await tx.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: data.passwordHash },
      });

      await tx.session.deleteMany({
        where: { userId: resetToken.userId },
      });

      await tx.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId },
      });

      return true;
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}

findUserSessions(userId: string) {
  return prisma.session.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

revokeUserSession(userId: string, sessionId: string) {
  return prisma.session.deleteMany({
    where: {
      id: sessionId,
      userId,
    },
  });
}

revokeOtherSessions(
  userId: string,
  currentSessionId: string
) {
  return prisma.session.deleteMany({
    where: {
      userId,
      id: { not: currentSessionId },
    },
  });
}
  
  
}
