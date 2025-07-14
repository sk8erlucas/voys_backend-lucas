-- DropForeignKey
ALTER TABLE `ml_tokens` DROP FOREIGN KEY `ml_tokens_store_id_fkey`;

-- AddForeignKey
ALTER TABLE `ml_tokens` ADD CONSTRAINT `ml_tokens_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
