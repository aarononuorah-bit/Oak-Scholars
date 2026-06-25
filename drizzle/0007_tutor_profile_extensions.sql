ALTER TABLE `users` ADD `tutorUniversity` varchar(200);--> statement-breakpoint
ALTER TABLE `users` ADD `tutorCourse` varchar(200);--> statement-breakpoint
ALTER TABLE `users` ADD `profilePhotoUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `bankAccountName` varchar(200);--> statement-breakpoint
ALTER TABLE `users` ADD `bankSortCode` varchar(10);--> statement-breakpoint
ALTER TABLE `users` ADD `bankAccountNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `bankPaypalEmail` varchar(320);
--> statement-breakpoint
ALTER TABLE `parent_link_requests` ADD `confirmCode` varchar(10);--> statement-breakpoint
ALTER TABLE `parent_link_requests` ADD `codeExpiresAt` timestamp;
