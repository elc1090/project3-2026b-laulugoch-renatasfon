-- Remove os dados do modelo antigo (25 perguntas e 5 dimensões)
DELETE FROM "Resposta";
DELETE FROM "Diagnostico";
DELETE FROM "Pergunta";

/*
  Warnings:

  - The values [GOBERNANZA,COMUNIDAD] on the enum `Dimensao` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Dimensao_new" AS ENUM ('AMBIENTAL', 'SOCIAL', 'ECONOMICA');
ALTER TABLE "Pergunta" ALTER COLUMN "dimensao" TYPE "Dimensao_new" USING ("dimensao"::text::"Dimensao_new");
ALTER TYPE "Dimensao" RENAME TO "Dimensao_old";
ALTER TYPE "Dimensao_new" RENAME TO "Dimensao";
DROP TYPE "public"."Dimensao_old";
COMMIT;
