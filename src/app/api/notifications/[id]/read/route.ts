export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuthApi, errorResponse } from "@/lib/auth";
import { markNotificationRead } from "@/lib/tasks";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthApi(req);
    const { id } = await params;

    const notification = await markNotificationRead(id);
    return Response.json({ notification });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}
