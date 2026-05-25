-- AlterTable
ALTER TABLE `students` ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `admission_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `blood_group` VARCHAR(5) NULL,
    ADD COLUMN `city` VARCHAR(100) NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `date_of_birth` DATETIME(3) NULL,
    ADD COLUMN `father_name` VARCHAR(255) NULL,
    ADD COLUMN `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `mother_name` VARCHAR(255) NULL,
    ADD COLUMN `nationality` VARCHAR(50) NULL DEFAULT 'Indian',
    ADD COLUMN `parent_email` VARCHAR(255) NULL,
    ADD COLUMN `parent_phone` VARCHAR(20) NULL,
    ADD COLUMN `phone` VARCHAR(20) NULL,
    ADD COLUMN `previous_class` VARCHAR(50) NULL,
    ADD COLUMN `previous_school` VARCHAR(255) NULL,
    ADD COLUMN `profile_photo` VARCHAR(255) NULL,
    ADD COLUMN `religion` VARCHAR(50) NULL,
    ADD COLUMN `state` VARCHAR(100) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `students_roll_number_idx` ON `students`(`roll_number`);
