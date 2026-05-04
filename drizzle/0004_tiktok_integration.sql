CREATE TABLE "tiktok_creator_tokens" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"tiktok_open_id" varchar(64) NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"scope" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tiktok_creator_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tiktok_post_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"share_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tiktok_post_metrics" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tiktok_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"publish_id" text NOT NULL,
	"tiktok_item_id" text,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"fail_reason" text,
	"title" text,
	"description" text,
	"photo_image_urls" jsonb NOT NULL,
	"privacy_level" varchar(64) DEFAULT 'PUBLIC_TO_EVERYONE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tiktok_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tiktok_creator_tokens" ADD CONSTRAINT "tiktok_creator_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tiktok_post_metrics" ADD CONSTRAINT "tiktok_post_metrics_post_id_tiktok_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."tiktok_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tiktok_posts" ADD CONSTRAINT "tiktok_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tiktok_creator_open_id" ON "tiktok_creator_tokens" USING btree ("tiktok_open_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tiktok_posts_publish_id" ON "tiktok_posts" USING btree ("publish_id");--> statement-breakpoint
CREATE POLICY "policy_Select_Tiktok_Creator_Tokens" ON "tiktok_creator_tokens" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "policy_Insert_Tiktok_Creator_Tokens" ON "tiktok_creator_tokens" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "policy_Update_Tiktok_Creator_Tokens" ON "tiktok_creator_tokens" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "policy_Delete_Tiktok_Creator_Tokens" ON "tiktok_creator_tokens" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "policy_Select_Tiktok_Post_Metrics" ON "tiktok_post_metrics" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "policy_Insert_Tiktok_Post_Metrics" ON "tiktok_post_metrics" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "policy_Update_Tiktok_Post_Metrics" ON "tiktok_post_metrics" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "policy_Delete_Tiktok_Post_Metrics" ON "tiktok_post_metrics" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "policy_Select_Tiktok_Posts" ON "tiktok_posts" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "policy_Insert_Tiktok_Posts" ON "tiktok_posts" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "policy_Update_Tiktok_Posts" ON "tiktok_posts" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "policy_Delete_Tiktok_Posts" ON "tiktok_posts" AS PERMISSIVE FOR DELETE TO public;
