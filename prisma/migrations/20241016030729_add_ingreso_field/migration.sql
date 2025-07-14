/*
  Warnings:

  - Made the column `ingreso` on table `packages` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `packages` MODIFY `ingreso` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
