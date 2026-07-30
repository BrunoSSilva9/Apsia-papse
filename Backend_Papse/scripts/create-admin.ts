import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const nome = process.env.ADMIN_NOME || "Administrador Local";
    const email = process.env.ADMIN_EMAIL || "projetopapse@gmail.com";
    const matricula = process.env.ADMIN_MATRICULA || "admin";
    const senha = process.env.ADMIN_PASSWORD || "123456";

    if (senha.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres.");
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const admin = await prisma.colaborador.upsert({
        where: { email },
        update: {
            nome,
            matricula,
            senha: senhaHash,
            role: Role.ADMIN,
            data_saida: null,
        },
        create: {
            nome,
            email,
            matricula,
            senha: senhaHash,
            role: Role.ADMIN,
            data_admissao: new Date(),
        },
        select: {
            idBolsista: true,
            nome: true,
            email: true,
            matricula: true,
            role: true,
            data_admissao: true,
        },
    });

    console.log("✅ Admin criado/atualizado com sucesso:");
    console.log(admin);
}

main()
    .catch((error) => {
        console.error("❌ Erro ao criar o administrador:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });