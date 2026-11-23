-- CreateTable
CREATE TABLE "ProgressoAcademia" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "melhorPontuacao" INTEGER NOT NULL,
    "concluidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressoAcademia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgressoAcademia_empresaId_key" ON "ProgressoAcademia"("empresaId");

-- AddForeignKey
ALTER TABLE "ProgressoAcademia" ADD CONSTRAINT "ProgressoAcademia_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
