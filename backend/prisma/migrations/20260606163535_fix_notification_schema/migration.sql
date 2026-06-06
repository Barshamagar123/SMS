-- CreateIndex
CREATE INDEX `notifications_is_read_idx` ON `notifications`(`is_read`);

-- CreateIndex
CREATE INDEX `notifications_related_id_idx` ON `notifications`(`related_id`);
