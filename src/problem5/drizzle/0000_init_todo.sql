CREATE TABLE "todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"priority" varchar(10) DEFAULT 'medium' NOT NULL,
	"due_date" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX "idx_todos_status" ON "todos" USING btree ("status");
CREATE INDEX "idx_todos_priority" ON "todos" USING btree ("priority");
CREATE INDEX "idx_todos_due_date" ON "todos" USING btree ("due_date");
CREATE INDEX "idx_todos_created_at" ON "todos" USING btree ("created_at");
CREATE INDEX "idx_todos_status_priority" ON "todos" USING btree ("status","priority");