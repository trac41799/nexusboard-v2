export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuthApi, errorResponse } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { updateProfileSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthApi(req);

    const { data: user } = await getSupabase()
      .from('users')
      .select('id, email, name, createdAt')
      .eq('id', session.userId)
      .maybeSingle();

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return Response.json({ user });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuthApi(req);
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const { data: user, error } = await getSupabase()
      .from('users')
      .update(parsed.data)
      .eq('id', session.userId)
      .select('id, email, name, createdAt')
      .single();

    if (error) {
      console.error("[me] update error:", error);
      return errorResponse("Internal server error", 500);
    }

    return Response.json({ user });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}
