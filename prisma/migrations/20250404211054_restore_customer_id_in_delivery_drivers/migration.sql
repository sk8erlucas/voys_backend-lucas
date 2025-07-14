-- AlterTable
ALTER TABLE `delivery_drivers` ADD COLUMN `customer_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `packages` ADD COLUMN `assignment_date` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `routes` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE `delivery_drivers` ADD CONSTRAINT `delivery_drivers_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
