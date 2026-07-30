import { PrismaClient, StatusSessao, ModalidadeSessao } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando migracao de relatorios legados para sessoes...");

  const relatoriosSemSessao = await prisma.relatorioEvolutivo.findMany({
    where: { idSessao: null },
    orderBy: { data_criacao: "asc" },
  });

  console.log(`Relatorios a migrar: ${relatoriosSemSessao.length}`);

  let migrados = 0;
  let erros = 0;

  for (const relatorio of relatoriosSemSessao) {
    try {
      await prisma.$transaction(async (tx) => {
        const sessao = await tx.sessao.create({
          data: {
            dataSessao: relatorio.data_criacao,
            status: StatusSessao.REALIZADA,
            modalidade: ModalidadeSessao.PRESENCIAL,
            observacao: "Sessao criada retroativamente a partir de relatorio legado.",
            idPaciente: relatorio.idPaciente,
            idBolsista: relatorio.idBolsista,
            data_criacao: relatorio.data_criacao,
          },
        });

        await tx.relatorioEvolutivo.update({
          where: { idRelatorio: relatorio.idRelatorio },
          data: { idSessao: sessao.idSessao },
        });
      });
      migrados++;
      if (migrados % 50 === 0) {
        console.log(`  ${migrados} relatorios migrados...`);
      }
    } catch (err) {
      erros++;
      console.error(`  Erro ao migrar relatorio #${relatorio.idRelatorio}:`, err);
    }
  }

  console.log(`\nMigracao concluida.`);
  console.log(`  Migrados com sucesso: ${migrados}`);
  console.log(`  Erros: ${erros}`);
}

main()
  .catch((e) => {
    console.error("Erro fatal na migracao:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
