/*
  Warnings:

  - Added the required column `amount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment` ADD COLUMN `amount` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `sale` ADD COLUMN `amount` DOUBLE NOT NULL;
