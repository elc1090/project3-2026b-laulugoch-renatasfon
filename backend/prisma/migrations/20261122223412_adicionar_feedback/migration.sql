-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "avaliacao" INTEGER NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_empresaId_idx" ON "Feedback"("empresaId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
