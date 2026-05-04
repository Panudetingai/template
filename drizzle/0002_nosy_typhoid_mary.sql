CREATE TABLE "line_mock_sessions" (
	"line_user_id" varchar(64) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "line_mock_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mock_product_generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"line_user_id" varchar(64) NOT NULL,
	"line_display_name" varchar(256),
	"source_image_data_url" text NOT NULL,
	"generated_image_data_url" text,
	"generate_product" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mock_product_generations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "policy_Select_Line_Mock_Sessions" ON "line_mock_sessions" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "policy_Insert_Line_Mock_Sessions" ON "line_mock_sessions" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "policy_Update_Line_Mock_Sessions" ON "line_mock_sessions" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "policy_Delete_Line_Mock_Sessions" ON "line_mock_sessions" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "policy_Select_Mock_Product_Generations" ON "mock_product_generations" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "policy_Insert_Mock_Product_Generations" ON "mock_product_generations" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "policy_Update_Mock_Product_Generations" ON "mock_product_generations" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "policy_Delete_Mock_Product_Generations" ON "mock_product_generations" AS PERMISSIVE FOR DELETE TO public;
