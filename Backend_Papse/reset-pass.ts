import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('papse123', 10);
  await prisma.colaborador.update({
    where: { matricula: 'ADM001' },
    data: { senha: hash }
  });
  console.log('Senha do ADM001 atualizada para: papse123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
