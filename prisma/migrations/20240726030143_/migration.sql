/*
  Warnings:

  - You are about to drop the `Endpoints` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EndpointsToPermission` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `resource` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Resource" AS ENUM ('TEST');

-- DropForeignKey
ALTER TABLE "_EndpointsToPermission" DROP CONSTRAINT "_EndpointsToPermission_A_fkey";

-- DropForeignKey
ALTER TABLE "_EndpointsToPermission" DROP CONSTRAINT "_EndpointsToPermission_B_fkey";

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "resource" "Resource" NOT NULL;

-- DropTable
DROP TABLE "Endpoints";

-- DropTable
DROP TABLE "_EndpointsToPermission";
