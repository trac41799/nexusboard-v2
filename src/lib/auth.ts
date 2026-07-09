import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);

const COOKIE_NAME = "nexusboard_token";

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAuthApi(req: NextRequest): Promise<JWTPayload> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) throw new Error("Unauthorized");
  const payload = await verifyToken(token);
  if (!payload) throw new Error("Unauthorized");
  return payload;
}

export function setTokenCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

export function clearTokenCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

export function authResponse(body: unknown, token: string, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Set-Cookie": setTokenCookie(token) },
  });
}

export function logoutResponse(body: unknown = { success: true }, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Set-Cookie": clearTokenCookie() },
  });
}

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function authMiddleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const payload = await verifyToken(token);
  if (!payload) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.headers.set("Set-Cookie", clearTokenCookie());
    return res;
  }
  return NextResponse.next();
}
