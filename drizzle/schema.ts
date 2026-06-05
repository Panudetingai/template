import { sql } from "drizzle-orm";
import { boolean, integer, jsonb, pgEnum, pgPolicy, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const plan = pgEnum("plan", ['free', 'pro', 'enterprise'])

export const users = pgTable("users", {
    id: uuid().default(sql`auth.uid()`).primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    avatarUrl: varchar("avatar_url", { length: 255 }),
    free: plan(),
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
]);


export const onboarding = pgTable("onborading", {
	id: uuid().default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: uuid().references(() => users.id).notNull(),
	step: integer().notNull().default(1),
	completed: boolean().notNull().default(false),
	onboardingJson: jsonb().notNull().default("{}"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("idx_user_id").using("btree", table.userId.asc().nullsLast()),
	pgPolicy("policy_select_onboarding", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("policy_insert_onboarding", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("policy_update_onboarding", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("policy_delete_onboarding", { as: "permissive", for: "delete", to: ["public"] }),
]);

