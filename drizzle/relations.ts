import { relations } from "drizzle-orm/relations";
import { generatedPosts, postShares, users, referrals, githubActivity, subscriptions, githubAccessTokens } from "./schema";

export const postSharesRelations = relations(postShares, ({one}) => ({
	generatedPost: one(generatedPosts, {
		fields: [postShares.postId],
		references: [generatedPosts.postId]
	}),
	user: one(users, {
		fields: [postShares.userId],
		references: [users.id]
	}),
}));

export const generatedPostsRelations = relations(generatedPosts, ({one, many}) => ({
	postShares: many(postShares),
	githubActivity: one(githubActivity, {
		fields: [generatedPosts.activityId],
		references: [githubActivity.activityId]
	}),
	user: one(users, {
		fields: [generatedPosts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	postShares: many(postShares),
	referrals_referredId: many(referrals, {
		relationName: "referrals_referredId_users_id"
	}),
	referrals_referrerId: many(referrals, {
		relationName: "referrals_referrerId_users_id"
	}),
	githubActivities: many(githubActivity),
	subscriptions: many(subscriptions),
	generatedPosts: many(generatedPosts),
	githubAccessTokens: many(githubAccessTokens),
}));

export const referralsRelations = relations(referrals, ({one}) => ({
	user_referredId: one(users, {
		fields: [referrals.referredId],
		references: [users.id],
		relationName: "referrals_referredId_users_id"
	}),
	user_referrerId: one(users, {
		fields: [referrals.referrerId],
		references: [users.id],
		relationName: "referrals_referrerId_users_id"
	}),
}));

export const githubActivityRelations = relations(githubActivity, ({one, many}) => ({
	user: one(users, {
		fields: [githubActivity.userId],
		references: [users.id]
	}),
	generatedPosts: many(generatedPosts),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
}));

export const githubAccessTokensRelations = relations(githubAccessTokens, ({one}) => ({
	user: one(users, {
		fields: [githubAccessTokens.userId],
		references: [users.id]
	}),
}));