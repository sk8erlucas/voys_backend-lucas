-- DropForeignKey
ALTER TABLE `packages` DROP FOREIGN KEY `packages_store_id_fkey`;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `packages_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
