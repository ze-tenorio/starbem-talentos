import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { sdk } from "./sdk";
import { verifySupabaseToken } from "../supabase";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  supabaseUser: SupabaseUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let supabaseUser: SupabaseUser | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }

  const authHeader = opts.req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      supabaseUser = await verifySupabaseToken(token);
    } catch {
      supabaseUser = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    supabaseUser,
  };
}
