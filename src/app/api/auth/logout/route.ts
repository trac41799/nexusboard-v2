export const dynamic = 'force-dynamic';

import { logoutResponse } from "@/lib/auth";

export async function POST() {
  return logoutResponse();
}
