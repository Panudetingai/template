import { sql } from "drizzle-orm"
import { foreignKey, integer, jsonb, pgEnum, pgPolicy, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

export const activityType = pgEnum("activity_type", ['push', 'pull_request', 'issue', 'commit'])
export const plan = pgEnum("plan", ['free', 'pro', 'enterprise'])
export const platform = pgEnum("platform", ['twitter', 'x', 'reddit', 'facebook', 'instagram', 'linkedin', 'other'])
export const subscriptionsPlan = pgEnum("subscriptions_plan", ['pro', 'team'])
export const subscriptionsStatus = pgEnum("subscriptions_status", ['pending', 'active', 'cancelled', 'expired', 'trial', 'paused', 'inactive'])
export const organizationType = pgEnum("organization_type", ['company', 'team', 'individual'])
export const organizationStatus = pgEnum("organization_status", ['active', 'inactive'])
export const organizationCategory = pgEnum("organization_category", ['technology', 'finance', 'hand made', 'government', 'non-profit', 'other'])

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

export const users = pgTable("users", {
    id: uuid().default(sql`auth.uid()`).primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(), // อีเมลควรเป็น notNull
    avatarUrl: varchar("avatar_url", { length: 255 }),
    free: plan(),
    daliyPostCount: integer("daliy_post_count").default(0),
    // ลบ .default('') ออก เพื่อให้เป็น NULL ได้
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
    lastActiveAt: timestamp("last_active_at", { mode: 'string' }).defaultNow(),
    username: varchar({ length: 255 }),
}, (table) => [
    uniqueIndex("idx_email").using("btree", table.email.asc().nullsLast()),
	pgPolicy("policy_Select_Users", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Users", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("policy_Update_Users", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("policy_Delete_Users", { as: "permissive", for: "delete", to: ["public"] }),
]);

export const organizations = pgTable("organizations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	organizationName: varchar("organization_name", { length: 255 }).notNull(),
	organizationType: organizationType(),
	organizationStatus: organizationStatus(),
	organizationCategory: organizationCategory(),
	organizationDescription: varchar("organization_description", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	pgPolicy("policy_Select_Organizations", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Organizations", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("policy_Update_Organizations", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("policy_Delete_Organizations", { as: "permissive", for: "delete", to: ["public"] }),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "organizations_user_id_users_id_fk"
	}),
]);

export const lineMockSessions = pgTable("line_mock_sessions", {
	lineUserId: varchar("line_user_id", { length: 64 }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
}, (table) => [
	pgPolicy("policy_Select_Line_Mock_Sessions", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Line_Mock_Sessions", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("policy_Update_Line_Mock_Sessions", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("policy_Delete_Line_Mock_Sessions", { as: "permissive", for: "delete", to: ["public"] }),
]);

export const mockProductGenerations = pgTable("mock_product_generations", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	lineUserId: varchar("line_user_id", { length: 64 }).notNull(),
	lineDisplayName: varchar("line_display_name", { length: 256 }),
	sourceImageDataUrl: text("source_image_data_url").notNull(), /** รูปต้นทาง — เดิม data URL; ตอนนี้แนะนำ Cloudinary secure URL */
	generatedImageDataUrl: text("generated_image_data_url"), /** ผล AI — Cloudinary โฟลเดอร์ product-ai-generate หรือ data URL เก่า */
	/** เมทาดาตาโฟลว์ + URL Cloudinary ใน cloudinary.* */
	generateProduct: jsonb("generate_product").notNull().$type<Record<string, unknown>>(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
}, (table) => [
	pgPolicy("policy_Select_Mock_Product_Generations", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Mock_Product_Generations", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("policy_Update_Mock_Product_Generations", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("policy_Delete_Mock_Product_Generations", { as: "permissive", for: "delete", to: ["public"] }),
]);

/** เซสชัน LINE: รอรูปดีไซน์แล้วตามด้วยรูปเสื้อ (garment) */
export const lineDesignToProductSessions = pgTable("line_design_to_product_sessions", {
	lineUserId: varchar("line_user_id", { length: 64 }).primaryKey().notNull(),
	/** รูปดีไซน์ — Cloudinary origin หรือ data URL เก่า */
	designImageDataUrl: text("design_image_data_url"),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
}, (table) => [
	pgPolicy("policy_Select_Line_Design_To_Product_Sessions", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Line_Design_To_Product_Sessions", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("policy_Update_Line_Design_To_Product_Sessions", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("policy_Delete_Line_Design_To_Product_Sessions", { as: "permissive", for: "delete", to: ["public"] }),
]);

/** ผล design-to-product จาก Worker /api/design-to-product */
export const designToProductGenerations = pgTable("design_to_product_generations", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	lineUserId: varchar("line_user_id", { length: 64 }).notNull(),
	lineDisplayName: varchar("line_display_name", { length: 256 }),
	designImageDataUrl: text("design_image_data_url").notNull(), /** Cloudinary origin */
	productImageDataUrl: text("product_image_data_url").notNull(), /** Cloudinary origin (รูปเสื้อ) */
	/** ผลลัพธ์ — Cloudinary product-ai-generate หรือ data URL เก่า */
	resultImageDataUrl: text("result_image_data_url"),
	/** ข้อความฟิลด์ product ที่ส่งไป API */
	productPrompt: text("product_prompt").notNull(),
	/** พารามิเตอร์ฟอร์มที่ส่ง (faithful, remove_bg, shot, …) */
	apiFormParams: jsonb("api_form_params").notNull().$type<Record<string, string>>(),
	/** วิเคราะห์รูปเสื้อจาก OpenRouter (ถ้ามี) */
	garmentAnalysis: jsonb("garment_analysis").$type<Record<string, unknown>>(),
	errorMessage: text("error_message"),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
}, (table) => [
	pgPolicy("policy_Select_Design_To_Product_Generations", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Design_To_Product_Generations", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("policy_Update_Design_To_Product_Generations", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("policy_Delete_Design_To_Product_Generations", { as: "permissive", for: "delete", to: ["public"] }),
]);

export const productionGeneratedDesigns = pgTable("production_generated_designs", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	prompt: text("prompt").notNull(),
	generatedImageDataUrl: text("generated_image_data_url").notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
}, (table) => [
	pgPolicy("policy_Select_Product_Generations", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Product_Generations", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("policy_Update_Product_Generations", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("policy_Delete_Product_Generations", { as: "permissive", for: "delete", to: ["public"] }),
]);

/** OAuth + token ต่อผู้ใช้แอป (เชื่อมบัญชี TikTok) */
export const tiktokCreatorTokens = pgTable("tiktok_creator_tokens", {
	userId: uuid("user_id").primaryKey().notNull(),
	tiktokOpenId: varchar("tiktok_open_id", { length: 64 }).notNull(),
	accessToken: text("access_token").notNull(),
	refreshToken: text("refresh_token").notNull(),
	expiresAt: timestamp("expires_at", { mode: "string", withTimezone: true }).notNull(),
	scope: text("scope"),
	createdAt: timestamp("created_at", { mode: "string", withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("idx_tiktok_creator_open_id").on(table.tiktokOpenId),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "tiktok_creator_tokens_user_id_users_id_fk",
	}),
	pgPolicy("policy_Select_Tiktok_Creator_Tokens", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Tiktok_Creator_Tokens", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("policy_Update_Tiktok_Creator_Tokens", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("policy_Delete_Tiktok_Creator_Tokens", { as: "permissive", for: "delete", to: ["public"] }),
]);

/** โพสต์ผ่าน Content Posting API (รูปหลายแผ่น = photo carousel) */
export const tiktokPosts = pgTable("tiktok_posts", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	publishId: text("publish_id").notNull(),
	tiktokItemId: text("tiktok_item_id"),
	/** pending | processing | published | failed */
	status: varchar("status", { length: 32 }).default("pending").notNull(),
	failReason: text("fail_reason"),
	title: text("title"),
	description: text("description"),
	photoImageUrls: jsonb("photo_image_urls").notNull().$type<string[]>(),
	privacyLevel: varchar("privacy_level", { length: 64 }).default("PUBLIC_TO_EVERYONE").notNull(),
	createdAt: timestamp("created_at", { mode: "string", withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("idx_tiktok_posts_publish_id").on(table.publishId),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "tiktok_posts_user_id_users_id_fk",
	}),
	pgPolicy("policy_Select_Tiktok_Posts", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Tiktok_Posts", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("policy_Update_Tiktok_Posts", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("policy_Delete_Tiktok_Posts", { as: "permissive", for: "delete", to: ["public"] }),
]);

/** snapshot ยอดวิว/ไลก์/คอมเมนต์ — ดึงซ้ำได้เพื่อกราฟ / near real-time polling */
export const tiktokPostMetrics = pgTable("tiktok_post_metrics", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	capturedAt: timestamp("captured_at", { mode: "string", withTimezone: true }).defaultNow().notNull(),
	viewCount: integer("view_count").default(0).notNull(),
	likeCount: integer("like_count").default(0).notNull(),
	commentCount: integer("comment_count").default(0).notNull(),
	shareCount: integer("share_count").default(0).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.postId],
		foreignColumns: [tiktokPosts.id],
		name: "tiktok_post_metrics_post_id_tiktok_posts_id_fk",
	}).onDelete("cascade"),
	pgPolicy("policy_Select_Tiktok_Post_Metrics", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_Insert_Tiktok_Post_Metrics", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("policy_Update_Tiktok_Post_Metrics", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("policy_Delete_Tiktok_Post_Metrics", { as: "permissive", for: "delete", to: ["public"] }),
]);
