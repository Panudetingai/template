-- Add INSERT and UPDATE policies for github_access_tokens
CREATE POLICY "policy_Insert_Github_Access_Tokens" ON "github_access_tokens" AS PERMISSIVE FOR INSERT TO public;
CREATE POLICY "policy_Update_Github_Access_Tokens" ON "github_access_tokens" AS PERMISSIVE FOR UPDATE TO public;
