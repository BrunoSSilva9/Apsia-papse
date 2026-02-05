-- AlterTable
ALTER TABLE `paciente` ADD COLUMN `data_aceite_termo` DATETIME(3) NULL,
    ADD COLUMN `ip_origem` VARCHAR(45) NULL,
    ADD COLUMN `termo_lgpd` BOOLEAN NOT NULL DEFAULT false;
