/*
  Warnings:

  - Added the required column `Ingreso` to the `packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sucursalDestino` to the `packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sucursalOrigen` to the `packages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `packages` ADD COLUMN `Ingreso` VARCHAR(191) NOT NULL,
    ADD COLUMN `sucursalDestino` VARCHAR(191) NOT NULL,
    ADD COLUMN `sucursalOrigen` VARCHAR(191) NOT NULL;
