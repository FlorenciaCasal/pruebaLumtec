/*
  Warnings:

  - You are about to drop the column `depthCm` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `heightCm` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `weightKg` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `widthCm` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SINGLE', 'KIT');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "depthCm",
DROP COLUMN "heightCm",
DROP COLUMN "weightKg",
DROP COLUMN "widthCm",
ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'SINGLE';

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "widthCm" DOUBLE PRECISION NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "depthCm" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
