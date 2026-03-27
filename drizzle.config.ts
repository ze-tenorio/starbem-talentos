import { defineConfig } from "drizzle-kit";

// This config is only used if you want to generate SQL from the schema.
// The app itself connects to Supabase via the @supabase/supabase-js client.
// Create your tables via the Supabase Dashboard SQL Editor using drizzle/schema.ts as reference.

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
});
