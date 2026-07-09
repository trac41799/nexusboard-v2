import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
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

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse("Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, name, passwordHash },
    });

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
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
