-- AlterTable
ALTER TABLE `cart` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'open';

-- AlterTable
ALTER TABLE `product` MODIFY `description` TEXT NOT NULL;
