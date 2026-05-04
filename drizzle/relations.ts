import { relations } from "drizzle-orm/relations";
import { subscriptions, users } from "./schema";

export const usersRelations = relations(users, ({many}) => ({
	subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
}));
