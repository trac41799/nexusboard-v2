export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuthApi, errorResponse } from "@/lib/auth";
import { getUserNotifications } from "@/lib/tasks";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthApi(req);
    const notifications = await getUserNotifications(session.userId);
    return Response.json({ notifications });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}
