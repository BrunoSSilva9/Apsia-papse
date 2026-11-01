-- AlterTable
ALTER TABLE `RelatorioEvolutivo` ADD COLUMN `idSessao` INTEGER NULL;

-- CreateTable
CREATE TABLE `Sessao` (
    `idSessao` INTEGER NOT NULL AUTO_INCREMENT,
    `dataSessao` DATE NOT NULL,
    `status` ENUM('REALIZADA', 'FALTA_JUSTIFICADA', 'FALTA_NAO_JUSTIFICADA', 'CANCELADA') NOT NULL,
    `modalidade` ENUM('PRESENCIAL', 'ONLINE', 'TELEFONE', 'OUTRO') NOT NULL DEFAULT 'PRESENCIAL',
    `duracao` INTEGER NULL,
    `observacao` VARCHAR(500) NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idPaciente` INTEGER NOT NULL,
    `idBolsista` INTEGER NOT NULL,

    PRIMARY KEY (`idSessao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `RelatorioEvolutivo_idSessao_key` ON `RelatorioEvolutivo`(`idSessao`);

-- AddForeignKey
ALTER TABLE `RelatorioEvolutivo` ADD CONSTRAINT `RelatorioEvolutivo_idSessao_fkey` FOREIGN KEY (`idSessao`) REFERENCES `Sessao`(`idSessao`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sessao` ADD CONSTRAINT `Sessao_idPaciente_fkey` FOREIGN KEY (`idPaciente`) REFERENCES `Paciente`(`idPaciente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sessao` ADD CONSTRAINT `Sessao_idBolsista_fkey` FOREIGN KEY (`idBolsista`) REFERENCES `Colaborador`(`idBolsista`) ON DELETE RESTRICT ON UPDATE CASCADE;