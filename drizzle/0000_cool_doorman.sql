-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."activity_type" AS ENUM('push', 'pull_request', 'issue', 'commit');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('free', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('twitter', 'x', 'reddit', 'facebook', 'instagram', 'linkedin', 'other');--> statement-breakpoint
CREATE TYPE "public"."subscriptions_plan" AS ENUM('pro', 'team');--> statement-breakpoint
CREATE TYPE "public"."subscriptions_status" AS ENUM('pending', 'active', 'cancelled', 'expired', 'trial', 'paused', 'inactive');
*/