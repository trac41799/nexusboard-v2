import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signToken, authResponse, errorResponse } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return errorResponse("Invalid email or password", 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return errorResponse("Invalid email or password", 401);
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
      token
    );
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
