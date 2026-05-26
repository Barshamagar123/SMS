-- AlterTable
ALTER TABLE `teachers` ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `hire_date` DATETIME(3) NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `phone` VARCHAR(20) NULL,
    ADD COLUMN `profile_photo` VARCHAR(255) NULL,
    ADD COLUMN `qualification` VARCHAR(255) NULL,
    ADD COLUMN `specialization` VARCHAR(255) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NULL;
