export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuthApi, errorResponse } from "@/lib/auth";
import { getTaskById, createComment, getComments } from "@/lib/tasks";
import { isWorkspaceMember } from "@/lib/workspaces";
import { createCommentSchema } from "@/lib/validations";

export async function POST(
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
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success)
      return errorResponse(parsed.error.issues[0].message, 400);

    const comment = await createComment({
      content: parsed.data.content,
      taskId: id,
      authorId: session.userId,
    });

    return Response.json({ comment }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}

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

    const comments = await getComments(id);
    return Response.json({ comments });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}
