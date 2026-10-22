import { NotFoundError } from "../../common/errors";
import { normalizeUrl } from "../../common/utils/normalized-url";
import { BookmarkRepository } from "./bookmark.repository";
import {
  CreateBookmarkInput,
  ListBookmarksInput,
  UpdateBookmarkInput,
} from "./bookmark.types";

export class BookmarkService {
  constructor(private readonly repository = new BookmarkRepository()) {}

  create(userId: string, data: CreateBookmarkInput) {
    const normalizedUrl = normalizeUrl(data.url);

    return this.repository.create(userId, data, normalizedUrl);
  }

  list(userId: string, filters: ListBookmarksInput) {
    return this.repository.findAll(userId, filters);
  }

  async getById(userId: string, id: string) {
    const bookmark = await this.repository.findById(userId, id);

    if (!bookmark) {
      throw new NotFoundError("Bookmark not found");
    }
    return bookmark;
  }

  async update(userId: string, id: string, data: UpdateBookmarkInput) {
    const normalizedUrl = data.url ? normalizeUrl(data.url) : undefined;

    const bookmark = await this.repository.update(userId, id, {
      ...data,
      ...(normalizedUrl !== undefined && { normalizedUrl }),
    });
    if (!bookmark) {
      throw new NotFoundError("Bookmark not found");
    }
    return bookmark;
  }

  async delete(userId: string, id: string) {
    const result = await this.repository.delete(userId, id);
    if (result.count === 0) {
      throw new NotFoundError("Bookmark not found");
    }
  }

  async archive(userId: string, id: string) {
    const bookmark = await this.repository.archive(userId, id);
    if (!bookmark) {
      throw new NotFoundError("Bookmark not found");
    }
  }

  async restore(userId: string, id: string) {
    const bookmark = await this.repository.restore(userId, id);
    if (!bookmark) {
      throw new NotFoundError("Bookmark not found");
    }
    return bookmark;
  }

  async restoreAll(userId: string) {
    const result = await this.repository.restoreAll(userId);

    return { restoredCount: result.count };
  }
}
