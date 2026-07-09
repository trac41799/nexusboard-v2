import { NextRequest } from "next/server";
import { requireAuth, errorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

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
    const session = await requireAuth();
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: parsed.data,
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return Response.json({ user });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}
