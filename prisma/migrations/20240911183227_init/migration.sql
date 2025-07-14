/*
  Warnings:

  - You are about to drop the column `coordinates` on the `routes` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `routes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `routes` DROP COLUMN `coordinates`,
    DROP COLUMN `name`;
