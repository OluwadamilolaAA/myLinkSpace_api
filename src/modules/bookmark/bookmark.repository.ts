import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

import type {
  CreateBookmarkInput,
  UpdateBookmarkInput,
  ListBookmarksInput,
} from "./bookmark.types.js";

export class BookmarkRepository {
  create(userId: string, data: CreateBookmarkInput, normalizedUrl: string) {
    return prisma.bookmark.create({
      data: {
        ...data,
        normalizedUrl,
        userId,
      },
    });
  }

  async findAll(userId: string, filters: ListBookmarksInput) {
    const where: Prisma.BookmarkWhereInput = {
      userId,
      isArchived: filters.archived === "true",
    };

    if (filters.category) {
      where.category = {
        equals: filters.category,
        mode: "insensitive",
      };
    }

    if (filters.tag) {
      where.tags = {
        has: filters.tag,
      };
    }

    if (filters.search) {
      const search = filters.search;

      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { url: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (filters.page - 1) * filters.limit;

    const orderBy: Prisma.BookmarkOrderByWithRelationInput[] =
      filters.sort === "title"
        ? [{ title: "asc" }, { id: "asc" }]
        : [{ createdAt: "desc" }, { id: "desc" }];

    const [bookmarks, total] = await prisma.$transaction([
      prisma.bookmark.findMany({
        where,
        orderBy,
        skip,
        take: filters.limit,
      }),
      prisma.bookmark.count({ where }),
    ]);

    return {
      bookmarks,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  findById(userId: string, id: string) {
    return prisma.bookmark.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    data: UpdateBookmarkInput & {
      normalizedUrl?: string;
    },
  ) {
    const records = await prisma.bookmark.updateManyAndReturn({
      where: { id, userId },
      data,
      limit: 1,
    });

    return records[0] ?? null;
  }

  delete(userId: string, id: string) {
    return prisma.bookmark.deleteMany({
      where: { id, userId },
    });
  }

  async archive(userId: string, id: string) {
    const records = await prisma.bookmark.updateManyAndReturn({
      where: {
        id,
        userId,
        isArchived: false,
      },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
      limit: 1,
    });

    return records[0] ?? null;
  }

  async restore(userId: string, id: string) {
    const records = await prisma.bookmark.updateManyAndReturn({
      where: {
        id,
        userId,
        isArchived: true,
      },
      data: {
        isArchived: false,
        archivedAt: null,
      },
      limit: 1,
    });

    return records[0] ?? null;
  }

  restoreAll(userId: string) {
    return prisma.bookmark.updateMany({
      where: {
        userId,
        isArchived: true,
      },
      data: {
        isArchived: false,
        archivedAt: null,
      },
    });
  }
}
