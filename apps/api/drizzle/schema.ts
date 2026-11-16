import { sql } from "drizzle-orm";
import { boolean, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const plan = pgEnum("plan", ['free', 'pro', 'enterprise'])

export const users = pgTable("users", {
    id: uuid().default(sql`auth.uid()`).primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    avatarUrl: varchar("avatar_url", { length: 255 }),
    /** The user's current plan (column is historically named `free`). */
    free: plan(),
    referralCode: varchar("referral_code", { length: 255 }),
    referredBy: varchar("referred_by", { length: 255 }),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
    lastActiveAt: timestamp("last_active_at", { mode: 'string' }).defaultNow(),
    username: varchar({ length: 255 }),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
}, (table) => [
    uniqueIndex("idx_email").using("btree", table.email.asc().nullsLast()),
    uniqueIndex("idx_referral_code").using("btree", table.referralCode.asc().nullsLast()),
]).enableRLS();

export const onboarding = pgTable("onboarding", {
	id: uuid().default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: uuid().references(() => users.id).notNull(),
	completed: boolean().notNull().default(false),
	onboardingJson: jsonb().notNull().default("{}"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("idx_user_id").using("btree", table.userId.asc().nullsLast()),
]).enableRLS();

export const onboardingSteps = pgTable("onboarding_steps", {
	id: uuid().default(sql`gen_random_uuid()`).primaryKey().notNull(),
	description: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	json: jsonb().default("{}"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("idx_title").using("btree", table.title.asc().nullsLast()),
]).enableRLS();


/** One row per Stripe subscription, kept in sync by the Stripe webhook. */
export const subscriptions = pgTable("subscriptions", {
	/** Stripe subscription id (sub_...). */
	id: text().primaryKey().notNull(),
	userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
	status: varchar({ length: 50 }).notNull(),
	priceId: varchar("price_id", { length: 255 }).notNull(),
	interval: varchar({ length: 10 }),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("idx_subscriptions_user_id").using("btree", table.userId.asc().nullsLast()),
]).enableRLS();

/** Processed Stripe webhook events — makes the webhook handler idempotent. */
export const stripeEvents = pgTable("stripe_events", {
	/** Stripe event id (evt_...). */
	id: text().primaryKey().notNull(),
	type: varchar({ length: 100 }).notNull(),
	processedAt: timestamp("processed_at", { mode: 'string' }).defaultNow(),
}).enableRLS();
