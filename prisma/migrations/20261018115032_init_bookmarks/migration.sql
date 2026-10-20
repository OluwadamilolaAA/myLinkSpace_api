-- CreateTable
CREATE TABLE "Bookmark" (
    "id" UUID NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "url" TEXT NOT NULL,
    "normalizedUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" VARCHAR(35) NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_normalizedUrl_key" ON "Bookmark"("normalizedUrl");

-- CreateIndex
CREATE INDEX "Bookmark_isArchived_createdAt_idx" ON "Bookmark"("isArchived", "createdAt");

-- CreateIndex
CREATE INDEX "Bookmark_category_idx" ON "Bookmark"("category");
