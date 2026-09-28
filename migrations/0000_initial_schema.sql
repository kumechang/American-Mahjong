CREATE TABLE `City` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`state` text NOT NULL,
	`slug` text NOT NULL,
	`latitude` real,
	`longitude` real,
	`published` integer DEFAULT false NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `City_slug_unique` ON `City` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `City_name_state_key` ON `City` (`name`,`state`);--> statement-breakpoint
CREATE TABLE `Club` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`cityId` text NOT NULL,
	`address` text,
	`website` text,
	`phone` text,
	`email` text,
	`latitude` real,
	`longitude` real,
	`beginnerFriendly` integer DEFAULT false NOT NULL,
	`lessonsAvailable` integer DEFAULT false NOT NULL,
	`openPlay` integer DEFAULT false NOT NULL,
	`socialPlay` integer DEFAULT false NOT NULL,
	`womenOnly` integer DEFAULT false NOT NULL,
	`free` integer DEFAULT false NOT NULL,
	`price` real,
	`schedule` text,
	`sourceUrl` text,
	`lastVerifiedAt` text,
	`status` text DEFAULT 'NEEDS_REVIEW' NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Club_slug_unique` ON `Club` (`slug`);--> statement-breakpoint
CREATE INDEX `Club_cityId_idx` ON `Club` (`cityId`);--> statement-breakpoint
CREATE INDEX `Club_beginnerFriendly_idx` ON `Club` (`beginnerFriendly`);--> statement-breakpoint
CREATE TABLE `Event` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`eventDate` text NOT NULL,
	`startTime` text,
	`endTime` text,
	`venue` text,
	`cityId` text NOT NULL,
	`clubId` text,
	`instructorId` text,
	`eventType` text DEFAULT 'OTHER' NOT NULL,
	`beginnerFriendly` integer DEFAULT false NOT NULL,
	`price` real,
	`registrationUrl` text,
	`sourceUrl` text,
	`lastVerifiedAt` text,
	`status` text DEFAULT 'NEEDS_REVIEW' NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clubId`) REFERENCES `Club`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`instructorId`) REFERENCES `Instructor`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Event_slug_unique` ON `Event` (`slug`);--> statement-breakpoint
CREATE INDEX `Event_cityId_idx` ON `Event` (`cityId`);--> statement-breakpoint
CREATE INDEX `Event_eventDate_idx` ON `Event` (`eventDate`);--> statement-breakpoint
CREATE TABLE `Instructor` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`cityId` text NOT NULL,
	`website` text,
	`contact` text,
	`privateLesson` integer DEFAULT false NOT NULL,
	`groupLesson` integer DEFAULT false NOT NULL,
	`onlineLesson` integer DEFAULT false NOT NULL,
	`beginnerLesson` integer DEFAULT false NOT NULL,
	`price` real,
	`sourceUrl` text,
	`lastVerifiedAt` text,
	`status` text DEFAULT 'NEEDS_REVIEW' NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Instructor_slug_unique` ON `Instructor` (`slug`);--> statement-breakpoint
CREATE INDEX `Instructor_cityId_idx` ON `Instructor` (`cityId`);--> statement-breakpoint
CREATE TABLE `Product` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`imageUrl` text,
	`affiliateUrl` text NOT NULL,
	`price` real,
	`beginnerPick` integer DEFAULT false NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Product_slug_unique` ON `Product` (`slug`);--> statement-breakpoint
CREATE INDEX `Product_category_idx` ON `Product` (`category`);