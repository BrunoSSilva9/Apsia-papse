/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Colaborador` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Colaborador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Paciente` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Historico` DROP FOREIGN KEY `Historico_idPaciente_fkey`;

-- DropForeignKey
ALTER TABLE `Historico` DROP FOREIGN KEY `Historico_id_ultimo_bolsista_fkey`;

-- DropForeignKey
ALTER TABLE `ListaEspera` DROP FOREIGN KEY `ListaEspera_idPaciente_fkey`;

-- DropForeignKey
ALTER TABLE `ListaRegular` DROP FOREIGN KEY `ListaRegular_idBolsista_fkey`;

-- DropForeignKey
ALTER TABLE `ListaRegular` DROP FOREIGN KEY `ListaRegular_idPaciente_fkey`;

-- DropForeignKey
ALTER TABLE `Protocolo` DROP FOREIGN KEY `Protocolo_idBolsista_fkey`;

-- DropForeignKey
ALTER TABLE `Protocolo` DROP FOREIGN KEY `Protocolo_idPaciente_fkey`;

-- DropForeignKey
ALTER TABLE `Regular` DROP FOREIGN KEY `Regular_idBolsista_fkey`;

-- DropForeignKey
ALTER TABLE `Regular` DROP FOREIGN KEY `Regular_idPaciente_fkey`;

-- DropForeignKey
ALTER TABLE `RelatorioEvolutivo` DROP FOREIGN KEY `RelatorioEvolutivo_idBolsista_fkey`;

-- DropForeignKey
ALTER TABLE `RelatorioEvolutivo` DROP FOREIGN KEY `RelatorioEvolutivo_idPaciente_fkey`;

-- AlterTable
ALTER TABLE `Colaborador` ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `resetToken` VARCHAR(191) NULL,
    ADD COLUMN `resetTokenExpires` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Paciente` ADD COLUMN `ativo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `email` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Colaborador_email_key` ON `Colaborador`(`email`);

-- AddForeignKey
ALTER TABLE `ListaEspera` ADD CONSTRAINT `ListaEspera_idPaciente_fkey` FOREIGN KEY (`idPaciente`) REFERENCES `Paciente`(`idPaciente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListaRegular` ADD CONSTRAINT `ListaRegular_idPaciente_fkey` FOREIGN KEY (`idPaciente`) REFERENCES `Paciente`(`idPaciente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListaRegular` ADD CONSTRAINT `ListaRegular_idBolsista_fkey` FOREIGN KEY (`idBolsista`) REFERENCES `Colaborador`(`idBolsista`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Protocolo` ADD CONSTRAINT `Protocolo_idPaciente_fkey` FOREIGN KEY (`idPaciente`) REFERENCES `Paciente`(`idPaciente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Protocolo` ADD CONSTRAINT `Protocolo_idBolsista_fkey` FOREIGN KEY (`idBolsista`) REFERENCES `Colaborador`(`idBolsista`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Regular` ADD CONSTRAINT `Regular_idPaciente_fkey` FOREIGN KEY (`idPaciente`) REFERENCES `Paciente`(`idPaciente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Regular` ADD CONSTRAINT `Regular_idBolsista_fkey` FOREIGN KEY (`idBolsista`) REFERENCES `Colaborador`(`idBolsista`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historico` ADD CONSTRAINT `Historico_idPaciente_fkey` FOREIGN KEY (`idPaciente`) REFERENCES `Paciente`(`idPaciente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historico` ADD CONSTRAINT `Historico_id_ultimo_bolsista_fkey` FOREIGN KEY (`id_ultimo_bolsista`) REFERENCES `Colaborador`(`idBolsista`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RelatorioEvolutivo` ADD CONSTRAINT `RelatorioEvolutivo_idPaciente_fkey` FOREIGN KEY (`idPaciente`) REFERENCES `Paciente`(`idPaciente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RelatorioEvolutivo` ADD CONSTRAINT `RelatorioEvolutivo_idBolsista_fkey` FOREIGN KEY (`idBolsista`) REFERENCES `Colaborador`(`idBolsista`) ON DELETE RESTRICT ON UPDATE CASCADE;
