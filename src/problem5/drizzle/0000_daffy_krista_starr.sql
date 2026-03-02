CREATE TABLE `todos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`due_date` text,
	`completed_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_todos_status` ON `todos` (`status`);--> statement-breakpoint
CREATE INDEX `idx_todos_priority` ON `todos` (`priority`);--> statement-breakpoint
CREATE INDEX `idx_todos_due_date` ON `todos` (`due_date`);--> statement-breakpoint
CREATE INDEX `idx_todos_created_at` ON `todos` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_todos_status_priority` ON `todos` (`status`,`priority`);