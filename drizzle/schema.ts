import { sql } from "drizzle-orm"
import { boolean, foreignKey, integer, pgEnum, pgPolicy, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

export const activityType = pgEnum("activity_type", ['push', 'pull_request', 'issue', 'commit'])
export const plan = pgEnum("plan", ['free', 'pro', 'enterprise'])
export const platform = pgEnum("platform", ['twitter', 'x', 'reddit', 'facebook', 'instagram', 'linkedin', 'other'])
export const subscriptionsPlan = pgEnum("subscriptions_plan", ['pro', 'team'])
export const subscriptionsStatus = pgEnum("subscriptions_status", ['pending', 'active', 'cancelled', 'expired', 'trial', 'paused', 'inactive'])


export const postShares = pgTable("post_shares", {
	shareId: uuid("share_id").defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id"),
	userId: uuid("user_id"),
	instagram: platform(),
	utmSource: varchar("utm_source", { length: 255 }).default(''),
	clickCount: integer("click_count").default(0),
	sharedAt: timestamp("shared_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("idx_post_shares_post_id").using("btree", table.postId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("idx_post_shares_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [generatedPosts.postId],
			name: "post_shares_post_id_generated_posts_post_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "post_shares_user_id_users_id_fk"
		}),
	pgPolicy("policy_Update_Post_Shares", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("policy_Delete_Post_Shares", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("policy_Select_Post_Shares", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Post_Shares", { as: "permissive", for: "insert", to: ["public"] }),
]);

export const referrals = pgTable("referrals", {
	referralId: uuid("referral_id").defaultRandom().primaryKey().notNull(),
	referrerId: uuid("referrer_id"),
	referredId: uuid("referred_id"),
	rewardGiven: boolean("reward_given").default(false),
	rewardGivenAt: timestamp("reward_given_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("idx_referrer_id_referred_id").using("btree", table.referrerId.asc().nullsLast().op("uuid_ops"), table.referredId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.referredId],
			foreignColumns: [users.id],
			name: "referrals_referred_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.referrerId],
			foreignColumns: [users.id],
			name: "referrals_referrer_id_users_id_fk"
		}),
	pgPolicy("policy_Select_Referrals", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Referrals", { as: "permissive", for: "insert", to: ["public"] }),
]);

export const githubActivity = pgTable("github_activity", {
	activityId: uuid("activity_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	repoName: varchar("repo_name", { length: 255 }).notNull(),
	push: activityType(),
	title: varchar({ length: 255 }).notNull(),
	body: text().notNull(),
	sha: varchar({ length: 255 }).notNull(),
	githubUrl: varchar("github_url", { length: 255 }).notNull(),
	activityCreatedAt: timestamp("activity_created_at", { mode: 'string' }).defaultNow(),
	fetchedAt: timestamp("fetched_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("idx_github_activity_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "github_activity_user_id_users_id_fk"
		}),
	pgPolicy("policy_Select_Github_Activity", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Github_Activity", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("policy_Update_Github_Activity", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("policy_Delete_Github_Activity", { as: "permissive", for: "delete", to: ["public"] }),
]);

export const subscriptions = pgTable("subscriptions", {
	subId: uuid("sub_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).default(''),
	stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).default(''),
	pro: subscriptionsPlan(),
	startDate: timestamp("start_date", { mode: 'string' }).defaultNow(),
	endDate: timestamp("end_date", { mode: 'string' }).defaultNow(),
	active: subscriptionsStatus(),
	priceThb: integer("price_thb").default(0),
	currentPeriodStart: timestamp("current_period_start", { mode: 'string' }).defaultNow(),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }).defaultNow(),
	cancelledAt: timestamp("cancelled_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("idx_stripe_customer_id").using("btree", table.stripeCustomerId.asc().nullsLast().op("text_ops")),
	uniqueIndex("idx_stripe_subscription_id").using("btree", table.stripeSubscriptionId.asc().nullsLast().op("text_ops")),
	uniqueIndex("idx_user_id_status").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.active.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "subscriptions_user_id_users_id_fk"
		}),
	pgPolicy("policy_Update_Subscriptions", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("policy_Delete_Subscriptions", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("policy_Select_Subscriptions", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Subscriptions", { as: "permissive", for: "insert", to: ["public"] }),
]);

export const generatedPosts = pgTable("generated_posts", {
	postId: uuid("post_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	activityId: uuid("activity_id"),
	style: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	promptUsed: text("prompt_used").notNull(),
	modelUsed: varchar("model_used", { length: 255 }).notNull(),
	hasWatermark: boolean("has_watermark").default(false),
	isCopied: boolean("is_copied").default(false),
	createAt: timestamp("create_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("idx_generated_posts_activity_id").using("btree", table.activityId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("idx_generated_posts_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.activityId],
			foreignColumns: [githubActivity.activityId],
			name: "generated_posts_activity_id_github_activity_activity_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "generated_posts_user_id_users_id_fk"
		}),
	pgPolicy("policy_Select_Generated_Posts", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Generated_Posts", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("policy_Update_Generated_Posts", { as: "permissive", for: "update", to: ["public"] }),
]);

export const githubAccessTokens = pgTable("github_access_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	providerToken: varchar("provider_token", { length: 255 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	owner: varchar({ length: 255 }).notNull(),
}, (table) => [
	uniqueIndex("idx_github_access_tokens_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "github_access_tokens_user_id_users_id_fk"
		}),
	pgPolicy("policy_Select_Github_Access_Tokens", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Github_Access_Tokens", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("policy_Update_Github_Access_Tokens", { as: "permissive", for: "update", to: ["public"] }),
]);

export const users = pgTable("users", {
    id: uuid().default(sql`auth.uid()`).primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(), // อีเมลควรเป็น notNull
    avatarUrl: varchar("avatar_url", { length: 255 }),
    free: plan(),
    daliyPostCount: integer("daliy_post_count").default(0),
    // ลบ .default('') ออก เพื่อให้เป็น NULL ได้
    referralCode: varchar("referral_code", { length: 255 }), 
    referredBy: varchar("referred_by", { length: 255 }),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
    lastActiveAt: timestamp("last_active_at", { mode: 'string' }).defaultNow(),
    username: varchar({ length: 255 }),
}, (table) => [
    uniqueIndex("idx_email").using("btree", table.email.asc().nullsLast()),
    uniqueIndex("idx_referral_code").using("btree", table.referralCode.asc().nullsLast()),
	pgPolicy("policy_Select_Users", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Users", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("policy_Update_Users", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("policy_Delete_Users", { as: "permissive", for: "delete", to: ["public"] }),
    // แนะนำให้ลบ uniqueIndex ของ referredBy ออก 
    // เพราะเพื่อนหลายคนควรถูกแนะนำโดยคนคนเดียวกันได้
]);
