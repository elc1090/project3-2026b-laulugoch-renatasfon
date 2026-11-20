/*
  Warnings:

  - A unique constraint covering the columns `[googleSub]` on the table `Empresa` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "googleSub" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_googleSub_key" ON "Empresa"("googleSub");
