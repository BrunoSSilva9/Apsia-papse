import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 A iniciar o Seed para 20 Pacientes...");

  const bolsistas = await prisma.colaborador.findMany({
    where: { role: Role.BOLSISTA },
  });

  if (bolsistas.length === 0) {
    console.error(
      "❌ ERRO: Nenhum bolsista encontrado. Execute primeiro o seed de utilizadores.",
    );
    return;
  }

  console.log(
    `👨‍⚕️ Foram encontrados ${bolsistas.length} bolsistas para distribuir os pacientes.`,
  );

  const pacientesData = [
    {
      nome: "Alice Souza",
      matricula: "2023001",
      curso: "Engenharia Civil",
      relato: "Ansiedade pré-exames",
    },
    {
      nome: "Bruno Lima",
      matricula: "2023002",
      curso: "Psicologia",
      relato: "Dificuldade de adaptação à cidade",
    },
    {
      nome: "Carla Dias",
      matricula: "2023003",
      curso: "Direito",
      relato: "Conflitos familiares intensos",
    },
    {
      nome: "Daniel Rocha",
      matricula: "2023004",
      curso: "Medicina",
      relato: "Sintomas de Burnout",
    },
    {
      nome: "Eduarda Alves",
      matricula: "2023005",
      curso: "Letras",
      relato: "Insónia e irritabilidade",
    },
    {
      nome: "Felipe Costa",
      matricula: "2023006",
      curso: "História",
      relato: "Desmotivação com o curso",
    },
    {
      nome: "Gabriela Nunes",
      matricula: "2023007",
      curso: "Pedagogia",
      relato: "Luto recente na família",
    },
    {
      nome: "Henrique Silva",
      matricula: "2023008",
      curso: "Computação",
      relato: "Isolamento social excessivo",
    },
    {
      nome: "Isabela Martins",
      matricula: "2023009",
      curso: "Arquitetura",
      relato: "Stress financeiro",
    },
    {
      nome: "João Vitor",
      matricula: "2023010",
      curso: "Biologia",
      relato: "Dúvidas vocacionais",
    },
    {
      nome: "Karina Melo",
      matricula: "2023011",
      curso: "Geologia",
      relato: "Crises de pânico pontuais",
    },
    {
      nome: "Lucas Mendes",
      matricula: "2023012",
      curso: "Agronomia",
      relato: "Dificuldade de concentração",
    },
    {
      nome: "Mariana Duarte",
      matricula: "2023013",
      curso: "Artes Visuais",
      relato: "Baixa autoestima",
    },
    {
      nome: "Natan Ribeiro",
      matricula: "2023014",
      curso: "Economia",
      relato: "Procrastinação crónica",
    },
    {
      nome: "Olivia Campos",
      matricula: "2023015",
      curso: "Química",
      relato: "Medo de falar em público",
    },
    {
      nome: "Paulo Antunes",
      matricula: "2023016",
      curso: "Física",
      relato: "Sentimento de solidão",
    },
    {
      nome: "Quintino Neves",
      matricula: "2023017",
      curso: "Matemática",
      relato: "Ansiedade social",
    },
    {
      nome: "Rafaela Pinto",
      matricula: "2023018",
      curso: "Geografia",
      relato: "Problemas de relacionamento",
    },
    {
      nome: "Samuel Torres",
      matricula: "2023019",
      curso: "Zootecnia",
      relato: "Saudades de casa",
    },
    {
      nome: "Tatiana Lopes",
      matricula: "2023020",
      curso: "Filosofia",
      relato: "Questões existenciais",
    },
  ];

  console.log("🏥 A criar registos no banco de dados...");

  for (let i = 0; i < pacientesData.length; i++) {
    const pData = pacientesData[i];
    if (!pData) continue;

    const bolsistaResponsavel = bolsistas[i % bolsistas.length];
    if (!bolsistaResponsavel) continue;

    let paciente = await prisma.paciente.findFirst({
      where: { matricula: pData.matricula },
    });

    if (!paciente) {
      paciente = await prisma.paciente.create({
        data: {
          nome: pData.nome,
          matricula: pData.matricula,
          data_nascimento: new Date("2000-06-15"), // Data genérica
          data_inscricao: new Date(),
          telefone: "94999999999",
          curso: pData.curso,
          relato: pData.relato,
        },
      });
    }

    await prisma.listaEspera.deleteMany({
      where: { idPaciente: paciente.idPaciente },
    });
    await prisma.listaRegular.deleteMany({
      where: { idPaciente: paciente.idPaciente },
    });
    await prisma.protocolo.deleteMany({
      where: { idPaciente: paciente.idPaciente },
    });
    await prisma.regular.deleteMany({
      where: { idPaciente: paciente.idPaciente },
    });
    await prisma.historico.deleteMany({
      where: { idPaciente: paciente.idPaciente },
    });

    if (i < 4) {
      await prisma.listaEspera.create({
        data: { idPaciente: paciente.idPaciente },
      });
      console.log(`[${i + 1}/20] ${pData.nome} -> 🕒 Lista de Espera`);
    } else if (i < 8) {
      await prisma.listaRegular.create({
        data: {
          idPaciente: paciente.idPaciente,
          idBolsista: bolsistaResponsavel.idBolsista,
        },
      });
      console.log(
        `[${i + 1}/20] ${pData.nome} -> 📝 Espera Regular (Bolsista: ${bolsistaResponsavel.nome})`,
      );
    } else if (i < 12) {
      await prisma.protocolo.create({
        data: {
          idPaciente: paciente.idPaciente,
          idBolsista: bolsistaResponsavel.idBolsista,
          data_inicio_atendimento: new Date(),
          qtde_sessoes: 1,
        },
      });
      console.log(
        `[${i + 1}/20] ${pData.nome} -> 📋 Protocolo (Bolsista: ${bolsistaResponsavel.nome})`,
      );
    } else if (i < 16) {
      await prisma.regular.create({
        data: {
          idPaciente: paciente.idPaciente,
          idBolsista: bolsistaResponsavel.idBolsista,
          data_inicio_atendimento: new Date(),
          qtde_sessoes: 5,
        },
      });
      console.log(
        `[${i + 1}/20] ${pData.nome} -> 🧠 Regular (Bolsista: ${bolsistaResponsavel.nome})`,
      );
    } else {
      await prisma.historico.create({
        data: {
          idPaciente: paciente.idPaciente,
          id_ultimo_bolsista: bolsistaResponsavel.idBolsista,
          data_desligamento: new Date(),
        },
      });
      console.log(
        `[${i + 1}/20] ${pData.nome} -> 📂 Histórico (Ex-Bolsista: ${bolsistaResponsavel.nome})`,
      );
    }
  }

  console.log("✅ Seed finalizado com sucesso! 20 Pacientes distribuídos.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
