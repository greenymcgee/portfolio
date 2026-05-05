/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "content" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Post_title_key" ON "Post"("title");
