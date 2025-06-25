/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `product` table. All the data in the column will be lost.
  - Added the required column `depthCm` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heightCm` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weightKg` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `widthCm` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `imageUrl`,
    ADD COLUMN `depthCm` DOUBLE NOT NULL,
    ADD COLUMN `heightCm` DOUBLE NOT NULL,
    ADD COLUMN `weightKg` DOUBLE NOT NULL,
    ADD COLUMN `widthCm` DOUBLE NOT NULL;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
