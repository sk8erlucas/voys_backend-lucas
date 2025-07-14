/*
  Warnings:

  - You are about to drop the column `ml_latitud` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `ml_longitud` on the `packages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `packages` DROP COLUMN `ml_latitud`,
    DROP COLUMN `ml_longitud`,
    ADD COLUMN `ml_latitude` DECIMAL(65, 30) NULL,
    ADD COLUMN `ml_longitude` DECIMAL(65, 30) NULL;
