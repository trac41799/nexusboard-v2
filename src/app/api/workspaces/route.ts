export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuth, errorResponse } from "@/lib/auth";
import { createWorkspace, getUserWorkspaces } from "@/lib/workspaces";
import { createWorkspaceSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const parsed = createWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const workspace = await createWorkspace({
      name: parsed.data.name,
      slug: parsed.data.slug,
      ownerId: session.userId,
    });

    return Response.json({ workspace }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}

export async function GET() {
  try {
    const session = await requireAuth();
    const workspaces = await getUserWorkspaces(session.userId);
    return Response.json({ workspaces });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}
