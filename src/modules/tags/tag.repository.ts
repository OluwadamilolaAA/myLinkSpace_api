import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

export class TagRepository {
  findUserBookmarkTags(userId: string) {
    return prisma.bookmark.findMany({
      where: { userId },
      select: {
        tags: true,
        isArchived: true,
      },
    });
  }

  async rename(userId: string, oldName: string, newName: string) {
    return prisma.$transaction(
      async (tx) => {
        const bookmarks = await tx.bookmark.findMany({
          where: {
            userId,
            tags: { has: oldName },
          },
          select: {
            id: true,
            tags: true,
          },
        });

        for (const bookmark of bookmarks) {
          const updatedTags = [
            ...new Set(
              bookmark.tags.map((tag) => (tag === oldName ? newName : tag)),
            ),
          ];

          await tx.bookmark.update({
            where: {
              id: bookmark.id,
              userId,
            },
            data: {
              tags: { set: updatedTags },
            },
          });
        }

        return bookmarks.length;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async delete(userId: string, tagName: string) {
    return prisma.$transaction(
      async (tx) => {
        const bookmarks = await tx.bookmark.findMany({
          where: {
            userId,
            tags: { has: tagName },
          },
          select: {
            id: true,
            tags: true,
          },
        });

        for (const bookmark of bookmarks) {
          const updatedTags = bookmark.tags.filter((tag) => tag !== tagName);

          await tx.bookmark.update({
            where: {
              id: bookmark.id,
              userId,
            },
            data: {
              tags: { set: updatedTags },
            },
          });
        }

        return bookmarks.length;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }
}
