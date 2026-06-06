-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `related_id` INTEGER NULL,
    ADD COLUMN `type` VARCHAR(50) NOT NULL DEFAULT 'GENERAL';

-- CreateIndex
CREATE INDEX `notifications_created_at_idx` ON `notifications`(`created_at`);

-- CreateIndex
CREATE INDEX `notifications_type_idx` ON `notifications`(`type`);
