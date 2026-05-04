CREATE TABLE "design_to_product_generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"line_user_id" varchar(64) NOT NULL,
	"line_display_name" varchar(256),
	"design_image_data_url" text NOT NULL,
	"product_image_data_url" text NOT NULL,
	"result_image_data_url" text,
	"product_prompt" text NOT NULL,
	"api_form_params" jsonb NOT NULL,
	"garment_analysis" jsonb,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "design_to_product_generations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "line_design_to_product_sessions" (
	"line_user_id" varchar(64) PRIMARY KEY NOT NULL,
	"design_image_data_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "line_design_to_product_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "policy_Select_Design_To_Product_Generations" ON "design_to_product_generations" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "policy_Insert_Design_To_Product_Generations" ON "design_to_product_generations" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "policy_Update_Design_To_Product_Generations" ON "design_to_product_generations" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "policy_Delete_Design_To_Product_Generations" ON "design_to_product_generations" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "policy_Select_Line_Design_To_Product_Sessions" ON "line_design_to_product_sessions" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "policy_Insert_Line_Design_To_Product_Sessions" ON "line_design_to_product_sessions" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "policy_Update_Line_Design_To_Product_Sessions" ON "line_design_to_product_sessions" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "policy_Delete_Line_Design_To_Product_Sessions" ON "line_design_to_product_sessions" AS PERMISSIVE FOR DELETE TO public;