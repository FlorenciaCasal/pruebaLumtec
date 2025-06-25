/*
  Warnings:

  - You are about to drop the column `createdBy` on the `product` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_createdBy_fkey`;

-- DropIndex
DROP INDEX `Product_createdBy_fkey` ON `product`;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `createdBy`;

-- AlterTable
ALTER TABLE `sale` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
