-- AlterTable
ALTER TABLE `packages` ADD COLUMN `Cleared_Delivery_Person` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `Settled_Customer` BOOLEAN NOT NULL DEFAULT false;
