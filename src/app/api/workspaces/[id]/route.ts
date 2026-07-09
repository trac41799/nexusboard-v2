export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuthApi, errorResponse } from "@/lib/auth";
import {
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  isWorkspaceMember,
} from "@/lib/workspaces";
import { updateWorkspaceSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi(req);
    const { id } = await params;

    const workspace = await getWorkspaceById(id);
    if (!workspace) return errorResponse("Workspace not found", 404);

    const isMember = await isWorkspaceMember(session.userId, id);
    if (!isMember) return errorResponse("Access denied", 403);

    return Response.json({ workspace });
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

    const workspace = await getWorkspaceById(id);
    if (!workspace) return errorResponse("Workspace not found", 404);
    if (workspace.ownerId !== session.userId)
      return errorResponse("Only the owner can update this workspace", 403);

    const body = await req.json();
    const parsed = updateWorkspaceSchema.safeParse(body);
    if (!parsed.success)
      return errorResponse(parsed.error.issues[0].message, 400);

    const updated = await updateWorkspace(id, parsed.data);
    return Response.json({ workspace: updated });
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

    const workspace = await getWorkspaceById(id);
    if (!workspace) return errorResponse("Workspace not found", 404);
    if (workspace.ownerId !== session.userId)
      return errorResponse("Only the owner can delete this workspace", 403);

    await deleteWorkspace(id);
    return Response.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}
