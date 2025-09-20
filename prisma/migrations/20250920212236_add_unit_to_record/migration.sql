/*
  Warnings:

  - Added the required column `unit` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Record" ADD COLUMN     "unit" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Record_unit_idx" ON "Record"("unit");

-- CreateIndex
CREATE INDEX "Record_dataset_id_idx" ON "Record"("dataset_id");

-- Manualy add CreateIndex for JSONB field
CREATE INDEX "Record_data_gin_idx" ON "Record" USING GIN ("data");