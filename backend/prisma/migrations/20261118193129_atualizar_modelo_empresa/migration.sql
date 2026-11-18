-- CreateEnum
CREATE TYPE "TamanhoEmpresa" AS ENUM ('MICRO', 'PEQUENA', 'MEDIA');

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "numFuncionarios" INTEGER,
ADD COLUMN     "tamanho" "TamanhoEmpresa";
