/*
  Warnings:

  - You are about to drop the column `customer_id` on the `delivery_drivers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `delivery_drivers` DROP FOREIGN KEY `delivery_drivers_customer_id_fkey`;

-- AlterTable
ALTER TABLE `delivery_drivers` DROP COLUMN `customer_id`;
