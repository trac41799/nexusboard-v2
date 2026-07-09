export const dynamic = 'force-dynamic';

import { requireAuth, errorResponse } from "@/lib/auth";
import { getUserNotifications } from "@/lib/tasks";

export async function GET() {
  try {
    const session = await requireAuth();
    const notifications = await getUserNotifications(session.userId);
    return Response.json({ notifications });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}
