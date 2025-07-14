/*
  Warnings:

  - You are about to drop the column `Ingreso` on the `packages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `packages` DROP COLUMN `Ingreso`,
    ADD COLUMN `ingreso` VARCHAR(191) NULL,
    MODIFY `sucursalDestino` VARCHAR(191) NULL,
    MODIFY `sucursalOrigen` VARCHAR(191) NULL;
