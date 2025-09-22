/*
  Warnings:

  - You are about to drop the column `Gender` on the `user` table. All the data in the column will be lost.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `Gender`,
    ADD COLUMN `gender` VARCHAR(191) NOT NULL;
