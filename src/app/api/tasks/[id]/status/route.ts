export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuth, errorResponse } from "@/lib/auth";
import { getTaskById, updateTaskStatus } from "@/lib/tasks";
import { isWorkspaceMember } from "@/lib/workspaces";
import { updateTaskStatusSchema } from "@/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const task = await getTaskById(id);
    if (!task) return errorResponse("Task not found", 404);

    const isMember = await isWorkspaceMember(session.userId, task.workspaceId);
    if (!isMember) return errorResponse("Access denied", 403);

    const body = await req.json();
    const parsed = updateTaskStatusSchema.safeParse(body);
    if (!parsed.success)
      return errorResponse(parsed.error.issues[0].message, 400);

    const updated = await updateTaskStatus(id, parsed.data.status);
    return Response.json({ task: updated });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}
