import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando o Seed...");

  // 1. GARANTIR QUE EXISTEM BOLSISTAS (Do script anterior)
  // Vamos buscar os bolsistas existentes no banco para vincular aos pacientes
  const bolsistas = await prisma.colaborador.findMany({
    where: { role: Role.BOLSISTA },
  });

  if (bolsistas.length === 0) {
    console.error(
      "❌ ERRO: Nenhum bolsista encontrado. Rode o seed de usuários primeiro ou crie bolsistas manualmente.",
    );
    return;
  }

  console.log(`👨‍⚕️ Encontrados ${bolsistas.length} bolsistas para vincular.`);

  // 2. DADOS DOS 10 PACIENTES FICTÍCIOS
  const pacientesData = [
    {
      nome: "Alice Souza",
      matricula: "2023001",
      curso: "Engenharia Civil",
      relato: "Ansiedade pré-provas",
    },
    {
      nome: "Bruno Lima",
      matricula: "2023002",
      curso: "Psicologia",
      relato: "Dificuldade de adaptação",
    },
    {
      nome: "Carla Dias",
      matricula: "2023003",
      curso: "Direito",
      relato: "Problemas familiares",
    },
    {
      nome: "Daniel Rocha",
      matricula: "2023004",
      curso: "Medicina",
      relato: "Burnout acadêmico",
    },
    {
      nome: "Eduarda Alves",
      matricula: "2023005",
      curso: "Letras",
      relato: "Insônia constante",
    },
    {
      nome: "Felipe Costa",
      matricula: "2023006",
      curso: "História",
      relato: "Falta de motivação",
    },
    {
      nome: "Gabriela Nunes",
      matricula: "2023007",
      curso: "Pedagogia",
      relato: "Luto recente",
    },
    {
      nome: "Henrique Silva",
      matricula: "2023008",
      curso: "Computação",
      relato: "Isolamento social",
    },
    {
      nome: "Isabela Martins",
      matricula: "2023009",
      curso: "Arquitetura",
      relato: "Estresse financeiro",
    },
    {
      nome: "João Vitor",
      matricula: "2023010",
      curso: "Biologia",
      relato: "Dúvidas sobre o curso",
    },
  ];

  // 3. CRIAR PACIENTES E DISTRIBUIR NAS LISTAS
  console.log("🏥 Criando pacientes e distribuindo nas listas...");

  for (let i = 0; i < pacientesData.length; i++) {
    const pData = pacientesData[i];
    // Correção TypeScript: Verifica se pData existe antes de usar
    if (!pData) continue;

    // Seleciona um bolsista de forma rotativa (0, 1, 2, 3, 4, 0...)
    const bolsistaResponsavel = bolsistas[i % bolsistas.length];
    // Correção TypeScript: Verifica se bolsistaResponsavel existe antes de usar
    if (!bolsistaResponsavel) continue;

    // Cria o paciente (ou atualiza se já existir a matrícula)
    // Nota: Como 'matricula' no seu schema Paciente não é @unique, usaremos findFirst para evitar duplicatas na lógica
    let paciente = await prisma.paciente.findFirst({
      where: { matricula: pData.matricula },
    });

    if (!paciente) {
      paciente = await prisma.paciente.create({
        data: {
          nome: pData.nome,
          matricula: pData.matricula,
          data_nascimento: new Date("2000-01-01"), // Data genérica
          data_inscricao: new Date(),
          telefone: "94999999999",
          curso: pData.curso,
          relato: pData.relato,
        },
      });
    }

    // Limpar vínculos antigos para não dar erro de chave única se rodar o seed 2x
    // (Opcional, apenas para garantir que o seed seja "idempotente")
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

    // DISTRIBUIÇÃO LÓGICA (2 Pacientes para cada tipo de lista)
    if (i < 2) {
      // 1. LISTA DE ESPERA (Geral - Sem bolsista)
      await prisma.listaEspera.create({
        data: { idPaciente: paciente.idPaciente },
      });
      console.log(`└── ${pData.nome} -> Lista de Espera`);
    } else if (i < 4) {
      // 2. LISTA DE ESPERA REGULAR (Com bolsista)
      await prisma.listaRegular.create({
        data: {
          idPaciente: paciente.idPaciente,
          idBolsista: bolsistaResponsavel.idBolsista,
        },
      });
      console.log(
        `└── ${pData.nome} -> Espera Regular (Bolsista: ${bolsistaResponsavel.nome})`,
      );
    } else if (i < 6) {
      // 3. PROTOCOLO (Em atendimento)
      await prisma.protocolo.create({
        data: {
          idPaciente: paciente.idPaciente,
          idBolsista: bolsistaResponsavel.idBolsista,
          data_inicio_atendimento: new Date(),
          qtde_sessoes: 1,
        },
      });
      console.log(
        `└── ${pData.nome} -> Atendimento Protocolo (Bolsista: ${bolsistaResponsavel.nome})`,
      );
    } else if (i < 8) {
      // 4. REGULAR (Em atendimento)
      await prisma.regular.create({
        data: {
          idPaciente: paciente.idPaciente,
          idBolsista: bolsistaResponsavel.idBolsista,
          data_inicio_atendimento: new Date(),
          qtde_sessoes: 3,
        },
      });
      console.log(
        `└── ${pData.nome} -> Atendimento Regular (Bolsista: ${bolsistaResponsavel.nome})`,
      );
    } else {
      // 5. HISTÓRICO (Encerrado)
      await prisma.historico.create({
        data: {
          idPaciente: paciente.idPaciente,
          id_ultimo_bolsista: bolsistaResponsavel.idBolsista,
          data_desligamento: new Date(),
        },
      });
      console.log(
        `└── ${pData.nome} -> Histórico/Alta (Ex-Bolsista: ${bolsistaResponsavel.nome})`,
      );
    }
  }

  console.log("✅ Seed finalizado com sucesso!");
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
