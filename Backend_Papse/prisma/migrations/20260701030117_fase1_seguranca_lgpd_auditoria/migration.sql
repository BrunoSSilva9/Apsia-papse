-- CreateTable
CREATE TABLE `LogAuditoria` (
    `idLog` INTEGER NOT NULL AUTO_INCREMENT,
    `idBolsista` INTEGER NULL,
    `role` ENUM('ADMIN', 'BOLSISTA') NULL,
    `acao` VARCHAR(100) NOT NULL,
    `entidade` VARCHAR(100) NOT NULL,
    `entidadeId` INTEGER NULL,
    `pacienteId` INTEGER NULL,
    `data_hora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip_origem` VARCHAR(45) NULL,
    `user_agent` VARCHAR(255) NULL,

    PRIMARY KEY (`idLog`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
