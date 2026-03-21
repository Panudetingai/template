-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."activity_type" AS ENUM('push', 'pull_request', 'issue', 'commit');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('free', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('twitter', 'x', 'reddit', 'facebook', 'instagram', 'linkedin', 'other');--> statement-breakpoint
CREATE TYPE "public"."subscriptions_plan" AS ENUM('pro', 'team');--> statement-breakpoint
CREATE TYPE "public"."subscriptions_status" AS ENUM('pending', 'active', 'cancelled', 'expired', 'trial', 'paused', 'inactive');--> statement-breakpoint
CREATE TABLE "post_shares" (
	"share_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid,
	"user_id" uuid,
	"instagram" "platform",
	"utm_source" varchar(255) DEFAULT '',
	"click_count" integer DEFAULT 0,
	"shared_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "post_shares" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "referrals" (
	"referral_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" uuid,
	"referred_id" uuid,
	"reward_given" boolean DEFAULT false,
	"reward_given_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "referrals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "github_activity" (
	"activity_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"repo_name" varchar(255) NOT NULL,
	"push" "activity_type",
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"sha" varchar(255) NOT NULL,
	"github_url" varchar(255) NOT NULL,
	"activity_created_at" timestamp DEFAULT now(),
	"fetched_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "github_activity" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"sub_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"stripe_customer_id" varchar(255) DEFAULT '',
	"stripe_subscription_id" varchar(255) DEFAULT '',
	"pro" "subscriptions_plan",
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp DEFAULT now(),
	"active" "subscriptions_status",
	"price_thb" integer DEFAULT 0,
	"current_period_start" timestamp DEFAULT now(),
	"current_period_end" timestamp DEFAULT now(),
	"cancelled_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "generated_posts" (
	"post_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"activity_id" uuid,
	"style" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"prompt_used" text NOT NULL,
	"model_used" varchar(255) NOT NULL,
	"has_watermark" boolean DEFAULT false,
	"is_copied" boolean DEFAULT false,
	"create_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "generated_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "github_access_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"provider_token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"owner" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "github_access_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT auth.uid() NOT NULL,
	"email" varchar(255) DEFAULT '',
	"avatar_url" varchar(255) DEFAULT '',
	"free" "plan",
	"daliy_post_count" integer DEFAULT 0,
	"referral_code" varchar(255) DEFAULT '',
	"referred_by" varchar(255) DEFAULT '',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_active_at" timestamp DEFAULT now(),
	"username" varchar(255) DEFAULT ''
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "post_shares" ADD CONSTRAINT "post_shares_post_id_generated_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."generated_posts"("post_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_shares" ADD CONSTRAINT "post_shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_users_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_activity" ADD CONSTRAINT "github_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_posts" ADD CONSTRAINT "generated_posts_activity_id_github_activity_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."github_activity"("activity_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_posts" ADD CONSTRAINT "generated_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_access_tokens" ADD CONSTRAINT "github_access_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_post_shares_post_id" ON "post_shares" USING btree ("post_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_post_shares_user_id" ON "post_shares" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_referrer_id_referred_id" ON "referrals" USING btree ("referrer_id" uuid_ops,"referred_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_github_activity_user_id" ON "github_activity" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_stripe_customer_id" ON "subscriptions" USING btree ("stripe_customer_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_stripe_subscription_id" ON "subscriptions" USING btree ("stripe_subscription_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_id_status" ON "subscriptions" USING btree ("user_id" uuid_ops,"active" enum_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_generated_posts_activity_id" ON "generated_posts" USING btree ("activity_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_generated_posts_user_id" ON "generated_posts" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_github_access_tokens_user_id" ON "github_access_tokens" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_email" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_referral_code" ON "users" USING btree ("referral_code" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_referred_by" ON "users" USING btree ("referred_by" text_ops);--> statement-breakpoint
CREATE POLICY "policy_Update_Post_Shares" ON "post_shares" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "policy_Delete_Post_Shares" ON "post_shares" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "policy_Select_Post_Shares" ON "post_shares" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "policy_Insert_Post_Shares" ON "post_shares" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "policy_Select_Referrals" ON "referrals" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "policy_Insert_Referrals" ON "referrals" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "policy_Select_Github_Activity" ON "github_activity" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "policy_Insert_Github_Activity" ON "github_activity" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "policy_Update_Github_Activity" ON "github_activity" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "policy_Delete_Github_Activity" ON "github_activity" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "policy_Update_Subscriptions" ON "subscriptions" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "policy_Delete_Subscriptions" ON "subscriptions" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "policy_Select_Subscriptions" ON "subscriptions" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "policy_Insert_Subscriptions" ON "subscriptions" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "policy_Select_Generated_Posts" ON "generated_posts" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "policy_Insert_Generated_Posts" ON "generated_posts" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "policy_Update_Generated_Posts" ON "generated_posts" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "policy_Select_Github_Access_Tokens" ON "github_access_tokens" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "policy_Select_Users" ON "users" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "policy_Insert_Users" ON "users" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "policy_Update_Users" ON "users" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "policy_Delete_Users" ON "users" AS PERMISSIVE FOR DELETE TO public;
*/