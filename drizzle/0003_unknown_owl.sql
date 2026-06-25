CREATE TABLE `feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`fromUserId` int NOT NULL,
	`toUserId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tutor_availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tutorId` int NOT NULL,
	`dayOfWeek` varchar(20) NOT NULL,
	`startTime` varchar(10) NOT NULL,
	`endTime` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tutor_availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tutoring_relationships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tutorId` int NOT NULL,
	`studentId` int NOT NULL,
	`subjects` text NOT NULL,
	`level` varchar(50) NOT NULL,
	`status` enum('active','paused','completed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tutoring_relationships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tutoring_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`relationshipId` int NOT NULL,
	`tutorId` int NOT NULL,
	`studentId` int NOT NULL,
	`subject` varchar(100) NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`duration` int NOT NULL,
	`status` enum('scheduled','completed','cancelled','no-show') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tutoring_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','tutor','parent') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `parentOf` int;--> statement-breakpoint
ALTER TABLE `users` ADD `approvedAsTutor` int DEFAULT 0 NOT NULL;