-- Opsional: Import file ini di phpMyAdmin XAMPP jika ingin memakai MySQL
-- (Secara default api.php sudah berjalan otomatis memakai penyimpanan lokal JSON tanpa harus import SQL)

CREATE DATABASE IF NOT EXISTS `db_upload_soal_sman1pakem`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_upload_soal_sman1pakem`;

CREATE TABLE IF NOT EXISTS `exam_documents` (
  `id` VARCHAR(128) NOT NULL,
  `title` VARCHAR(300) NOT NULL,
  `subject` VARCHAR(120) NOT NULL,
  `grade` VARCHAR(30) NOT NULL,
  `assessmentType` VARCHAR(40) NOT NULL DEFAULT 'ASAS',
  `durationMinutes` INT NOT NULL DEFAULT 90,
  `estimatedQuestions` INT NOT NULL DEFAULT 40,
  `fileName` VARCHAR(260) NOT NULL,
  `fileFormat` VARCHAR(20) NOT NULL,
  `fileSizeBytes` BIGINT NOT NULL DEFAULT 0,
  `uploadedAt` VARCHAR(64) NOT NULL,
  `status` VARCHAR(60) NOT NULL DEFAULT 'Menunggu Review',
  `committeeNotes` TEXT NULL,
  `revisionFeedback` TEXT NULL,
  `verifiedBy` VARCHAR(120) NULL,
  `verifiedAt` VARCHAR(64) NULL,
  `fileDataUrl` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
