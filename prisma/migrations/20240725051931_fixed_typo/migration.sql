/*
  Warnings:

  - A unique constraint covering the columns `[action,description]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_description_key" ON "Permission"("action", "description");
