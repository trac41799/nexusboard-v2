export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuthApi, errorResponse } from "@/lib/auth";
import { getTaskById, updateTask, deleteTask } from "@/lib/tasks";
import { isWorkspaceMember } from "@/lib/workspaces";
import { updateTaskSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi(req);
    const { id } = await params;

    const task = await getTaskById(id);
    if (!task) return errorResponse("Task not found", 404);

    const isMember = await isWorkspaceMember(session.userId, task.workspaceId);
    if (!isMember) return errorResponse("Access denied", 403);

    return Response.json({ task });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi(req);
    const { id } = await params;

    const task = await getTaskById(id);
    if (!task) return errorResponse("Task not found", 404);

    const isMember = await isWorkspaceMember(session.userId, task.workspaceId);
    if (!isMember) return errorResponse("Access denied", 403);

    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success)
      return errorResponse(parsed.error.issues[0].message, 400);

    const updated = await updateTask(id, parsed.data);
    return Response.json({ task: updated });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi(req);
    const { id } = await params;

    const task = await getTaskById(id);
    if (!task) return errorResponse("Task not found", 404);

    const isMember = await isWorkspaceMember(session.userId, task.workspaceId);
    if (!isMember) return errorResponse("Access denied", 403);

    await deleteTask(id);
    return Response.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}
