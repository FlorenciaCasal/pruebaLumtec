/*
  Warnings:

  - Made the column `imageUrl` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `product` MODIFY `imageUrl` VARCHAR(191) NOT NULL;
