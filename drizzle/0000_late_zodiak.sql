CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`service` text NOT NULL,
	`design` text DEFAULT '' NOT NULL,
	`material` text DEFAULT '' NOT NULL,
	`color` text DEFAULT '' NOT NULL,
	`quote_amount` integer,
	`budget` text NOT NULL,
	`name` text NOT NULL,
	`contact_type` text NOT NULL,
	`contact` text NOT NULL,
	`watch_model` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`consent_at` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiries_reference_unique` ON `inquiries` (`reference`);--> statement-breakpoint
CREATE INDEX `idx_inquiries_created_at` ON `inquiries` (`created_at`);