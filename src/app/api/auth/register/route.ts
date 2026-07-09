export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import bcrypt from 'bcryptjs';
import { getSupabase } from "@/lib/supabase";
import { signToken, authResponse, errorResponse } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const { email, password, name } = parsed.data;

    const { data: existing } = await getSupabase()
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return errorResponse("Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: user, error } = await getSupabase()
      .from('users')
      .insert({ email, name, passwordHash })
      .select()
      .single();

    if (error) {
      console.error("[register] insert error:", error);
      return errorResponse("Internal server error", 500);
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return authResponse(
      {
        user: { id: user.id, email: user.email, name: user.name },
        token,
      },
      token,
      201
    );
  } catch (err) {
    console.error("[register]", err);
    return errorResponse("Internal server error", 500);
  }
}
