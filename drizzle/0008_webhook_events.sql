-- Add webhook_events table for idempotency
CREATE TABLE `webhook_events` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `eventId` varchar(255) NOT NULL UNIQUE,
  `eventType` varchar(100) NOT NULL,
  `payload` longtext NOT NULL,
  `processed` int NOT NULL DEFAULT 0,
  `processedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` timestamp NULL,
  KEY `idx_eventId` (`eventId`),
  KEY `idx_processed` (`processed`),
  KEY `idx_createdAt` (`createdAt`)
);
