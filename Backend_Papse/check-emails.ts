import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const duplicates = await prisma.$queryRaw`
    SELECT email, COUNT(*) as count 
    FROM Colaborador 
    WHERE email IS NOT NULL 
    GROUP BY email 
    HAVING COUNT(*) > 1;
  `;
  console.log("Emails duplicados encontrados:", duplicates);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
