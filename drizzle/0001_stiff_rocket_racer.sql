DROP POLICY "policy_Update_Post_Shares" ON "post_shares" CASCADE;--> statement-breakpoint
DROP POLICY "policy_Delete_Post_Shares" ON "post_shares" CASCADE;--> statement-breakpoint
DROP POLICY "policy_Select_Post_Shares" ON "post_shares" CASCADE;--> statement-breakpoint
DROP POLICY "policy_Insert_Post_Shares" ON "post_shares" CASCADE;--> statement-breakpoint
DROP TABLE "post_shares" CASCADE;--> statement-breakpoint
DROP POLICY "policy_Select_Referrals" ON "referrals" CASCADE;--> statement-breakpoint
DROP POLICY "policy_Insert_Referrals" ON "referrals" CASCADE;--> statement-breakpoint
DROP TABLE "referrals" CASCADE;--> statement-breakpoint
DROP POLICY "policy_Select_Github_Activity" ON "github_activity" CASCADE;--> statement-breakpoint
DROP POLICY "policy_Insert_Github_Activity" ON "github_activity" CASCADE;--> statement-breakpoint
DROP POLICY "policy_Update_Github_Activity" ON "github_activity" CASCADE;--> statement-breakpoint
DROP POLICY "policy_Delete_Github_Activity" ON "github_activity" CASCADE;--> statement-breakpoint
DROP TABLE "github_activity" CASCADE;--> statement-breakpoint
DROP POLICY "policy_Select_Generated_Posts" ON "generated_posts" CASCADE;--> statement-breakpoint
DROP POLICY "policy_Insert_Generated_Posts" ON "generated_posts" CASCADE;--> statement-breakpoint
DROP POLICY "policy_Update_Generated_Posts" ON "generated_posts" CASCADE;--> statement-breakpoint
DROP TABLE "generated_posts" CASCADE;--> statement-breakpoint
DROP POLICY "policy_Select_Github_Access_Tokens" ON "github_access_tokens" CASCADE;--> statement-breakpoint
DROP TABLE "github_access_tokens" CASCADE;--> statement-breakpoint
DROP INDEX "idx_referral_code";--> statement-breakpoint
DROP INDEX "idx_referred_by";--> statement-breakpoint
DROP INDEX "idx_email";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "avatar_url" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" DROP DEFAULT;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_email" ON "users" USING btree ("email");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "referral_code";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "referred_by";