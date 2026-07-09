export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuth, errorResponse } from "@/lib/auth";
import { createTask, getTasks } from "@/lib/tasks";
import { isWorkspaceMember } from "@/lib/workspaces";
import { createTaskSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success)
      return errorResponse(parsed.error.issues[0].message, 400);

    const isMember = await isWorkspaceMember(
      session.userId,
      parsed.data.workspaceId
    );
    if (!isMember) return errorResponse("Access denied to workspace", 403);

    const task = await createTask({
      ...parsed.data,
      creatorId: session.userId,
    });

    return Response.json({ task }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const workspaceId = url.searchParams.get("workspaceId");
    const status = url.searchParams.get("status") || undefined;
    const priority = url.searchParams.get("priority") || undefined;
    const assigneeId = url.searchParams.get("assigneeId") || undefined;

    if (!workspaceId) {
      return errorResponse("workspaceId query param is required", 400);
    }

    const isMember = await isWorkspaceMember(session.userId, workspaceId);
    if (!isMember) return errorResponse("Access denied to workspace", 403);

    const tasks = await getTasks({
      workspaceId,
      status,
      priority,
      assigneeId,
    });

    return Response.json({ tasks });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}
