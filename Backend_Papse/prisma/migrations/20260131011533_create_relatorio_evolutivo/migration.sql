-- CreateTable
CREATE TABLE `RelatorioEvolutivo` (
    `idRelatorio` INTEGER NOT NULL AUTO_INCREMENT,
    `texto` TEXT NOT NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idPaciente` INTEGER NOT NULL,
    `idBolsista` INTEGER NOT NULL,

    PRIMARY KEY (`idRelatorio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RelatorioEvolutivo` ADD CONSTRAINT `RelatorioEvolutivo_idPaciente_fkey` FOREIGN KEY (`idPaciente`) REFERENCES `Paciente`(`idPaciente`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RelatorioEvolutivo` ADD CONSTRAINT `RelatorioEvolutivo_idBolsista_fkey` FOREIGN KEY (`idBolsista`) REFERENCES `Colaborador`(`idBolsista`) ON DELETE CASCADE ON UPDATE CASCADE;
