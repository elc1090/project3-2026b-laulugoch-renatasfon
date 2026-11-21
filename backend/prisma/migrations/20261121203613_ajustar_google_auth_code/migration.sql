-- CreateTable
CREATE TABLE "GoogleAuthCode" (
    "id" SERIAL NOT NULL,
    "codeHash" TEXT NOT NULL,
    "empresaId" INTEGER,
    "cadastroPendenteId" INTEGER,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleAuthCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAuthCode_codeHash_key" ON "GoogleAuthCode"("codeHash");

-- CreateIndex
CREATE INDEX "GoogleAuthCode_expiresAt_idx" ON "GoogleAuthCode"("expiresAt");
