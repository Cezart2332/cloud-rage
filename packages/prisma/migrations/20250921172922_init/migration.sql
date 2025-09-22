/*
  Warnings:

  - Added the required column `admin` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `helper` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `admin` INTEGER NOT NULL,
    ADD COLUMN `helper` INTEGER NOT NULL;
