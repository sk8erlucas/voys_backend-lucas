/*
  Warnings:

  - Added the required column `customer_id` to the `delivery_drivers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `delivery_drivers` ADD COLUMN `customer_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `delivery_drivers` ADD CONSTRAINT `delivery_drivers_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
