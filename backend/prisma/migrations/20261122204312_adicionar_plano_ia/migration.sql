-- CreateTable
CREATE TABLE "PlanoIA" (
    "id" SERIAL NOT NULL,
    "diagnosticoId" INTEGER NOT NULL,
    "recomendacoes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanoIA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanoIA_diagnosticoId_key" ON "PlanoIA"("diagnosticoId");

-- AddForeignKey
ALTER TABLE "PlanoIA" ADD CONSTRAINT "PlanoIA_diagnosticoId_fkey" FOREIGN KEY ("diagnosticoId") REFERENCES "Diagnostico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
