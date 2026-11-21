-- CreateTable
CREATE TABLE "CadastroGooglePendente" (
    "id" SERIAL NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "googleSub" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CadastroGooglePendente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CadastroGooglePendente_tokenHash_key" ON "CadastroGooglePendente"("tokenHash");

-- CreateIndex
CREATE INDEX "CadastroGooglePendente_expiresAt_idx" ON "CadastroGooglePendente"("expiresAt");
