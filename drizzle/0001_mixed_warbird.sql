CREATE TABLE `announcement_banners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message` text NOT NULL,
	`type` enum('info','success','warning','promo') NOT NULL DEFAULT 'info',
	`linkText` varchar(100),
	`linkUrl` varchar(500),
	`isActive` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcement_banners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30),
	`subject` varchar(100) NOT NULL,
	`level` varchar(50) NOT NULL,
	`sessionType` varchar(50) NOT NULL,
	`preferredTime` varchar(50) NOT NULL,
	`message` text,
	`status` enum('new','contacted','confirmed','cancelled') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`subject` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','read','replied') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tutor_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30),
	`university` varchar(200) NOT NULL,
	`degreeSubject` varchar(200) NOT NULL,
	`yearOfStudy` varchar(50) NOT NULL,
	`subjects` text NOT NULL,
	`levels` text NOT NULL,
	`experience` text NOT NULL,
	`availability` text,
	`cvFileKey` varchar(500),
	`cvFileUrl` varchar(500),
	`coverLetter` text,
	`status` enum('new','reviewing','interview','accepted','rejected') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tutor_applications_id` PRIMARY KEY(`id`)
);
