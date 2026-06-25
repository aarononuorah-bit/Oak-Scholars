CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`email` varchar(320) NOT NULL,
	`stripeSessionId` varchar(200) NOT NULL,
	`stripePaymentIntentId` varchar(200),
	`packageName` varchar(200) NOT NULL,
	`subject` varchar(100),
	`level` varchar(50),
	`amountTotal` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'gbp',
	`status` enum('pending','paid','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_stripeSessionId_unique` UNIQUE(`stripeSessionId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(30);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(100);