
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { prisma } from "../src/lib/prisma.js";
import type { Dimensao } from "../src/generated/prisma/enums.js";

type PerguntaJson = {
  id: string;
  dimensao: Dimensao;
  ordem: number;
  texto: string;
};

async function main() {
  const caminho = join(process.cwd(), "prisma", "perguntas.json");

  const perguntas: PerguntaJson[] = JSON.parse(
    readFileSync(caminho, "utf-8")
  );

  if (perguntas.length !== 9) {
    throw new Error(
      `Esperava 9 perguntas, mas encontrei ${perguntas.length}.`
    );
  }

  for (const pergunta of perguntas) {
    await prisma.pergunta.upsert({
      where: { id: pergunta.id },
      update: {
        dimensao: pergunta.dimensao,
        ordem: pergunta.ordem,
        texto: pergunta.texto,
        ativa: true,
      },
      create: {
        id: pergunta.id,
        dimensao: pergunta.dimensao,
        ordem: pergunta.ordem,
        texto: pergunta.texto,
      },
    });
  }

  console.log(`${perguntas.length} perguntas cadastradas com sucesso.`);
}

main()
  .catch((erro) => {
    console.error("Erro ao cadastrar perguntas:", erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
