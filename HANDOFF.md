# NexusBoard v2 - Handoff Document

## Overview

NexusBoard v2 is a complete team collaboration platform built as a Next.js 14 (v16.2) monorepo with TypeScript, Tailwind CSS v4, Prisma v7, and Supabase. Everything deploys to Vercel in one command.

**Build Status**: PASSED (0 errors)
**Next.js Version**: 16.2.10 (Turbopack)
**Prisma Version**: 7.8.0
**Zod Version**: 4.4.3

---

## Project Structure

```
nexusboard-v2/
├── prisma/
│   └── schema.prisma          # Database models
├── prisma.config.ts           # Prisma v7 datasource config
├── src/
│   ├── middleware.ts          # Auth middleware (route protection)
│   ├── lib/
│   │   ├── prisma.ts          # PrismaClient singleton (pg adapter)
│   │   ├── supabase.ts         # Supabase client
│   │   ├── auth.ts             # JWT sign/verify/cookie helpers (jose)
│   │   ├── workspaces.ts       # Workspace CRUD helpers
│   │   ├── tasks.ts            # Task/Comment CRUD helpers
│   │   └── validations.ts      # Zod validation schemas
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx      # Variants: primary/secondary/outline/ghost/danger
│   │   │   ├── Input.tsx       # With label + error display
│   │   │   ├── Card.tsx        # Card, CardHeader, CardTitle
│   │   │   ├── Badge.tsx       # default/success/warning/danger/info
│   │   │   └── Avatar.tsx      # Initials-based, hash-colored
│   │   ├── TaskCard.tsx        # Draggable task card
│   │   ├── KanbanColumn.tsx    # Status column with drag-drop
│   │   ├── CreateTaskDialog.tsx # Modal task creation form
│   │   └── Navbar.tsx          # Top navigation bar
│   └── app/
│       ├── layout.tsx          # Root layout (Geist fonts)
│       ├── page.tsx            # Redirects to /login
│       ├── globals.css         # Tailwind v4 @import
│       ├── (auth)/
│       │   ├── layout.tsx
│       │   ├── login/page.tsx
│       │   └── register/page.tsx
│       ├── (dashboard)/
│       │   ├── layout.tsx      # Auth check + Navbar wrapper
│       │   ├── page.tsx        # Workspace list + create
│       │   ├── settings/page.tsx
│       │   └── workspaces/[id]/page.tsx  # Kanban board
│       └── api/
│           ├── auth/register/route.ts
│           ├── auth/login/route.ts
│           ├── auth/me/route.ts      (GET + PATCH)
│           ├── auth/logout/route.ts
│           ├── workspaces/route.ts   (GET + POST)
│           ├── workspaces/[id]/route.ts  (GET + PATCH + DELETE)
│           ├── tasks/route.ts        (GET + POST)
│           ├── tasks/[id]/route.ts   (GET + PATCH + DELETE)
│           ├── tasks/[id]/status/route.ts  (PATCH)
│           ├── tasks/[id]/comments/route.ts (GET + POST)
│           ├── notifications/route.ts (GET)
│           └── notifications/[id]/read/route.ts (PATCH)
├── .env.example
├── vercel.json
└── package.json
```

---

## Database Schema (Prisma v7)

6 models: **User**, **Workspace**, **WorkspaceMember**, **Task**, **Comment**, **Notification**

- `User`: id, email (unique), name, passwordHash, timestamps
- `Workspace`: id, name, slug (unique), ownerId -> User (Cascade)
- `WorkspaceMember`: userId + workspaceId (unique pair), role (OWNER/MEMBER)
- `Task`: title, description?, status (TODO/IN_PROGRESS/REVIEW/DONE), priority (LOW/MEDIUM/HIGH/URGENT), workspaceId, creatorId, assigneeId?, dueDate?, timestamps
- `Comment`: content, taskId, authorId, timestamps
- `Notification`: userId, type, title, body, read (bool), link?, timestamps

**Note**: Prisma v7 requires a `prisma.config.ts` file with `defineConfig({ datasource: { url: env('DATABASE_URL') } })` and a driver adapter (`@prisma/adapter-pg`) in the PrismaClient constructor.

---

## Auth System

- Uses `jose` (Edge-compatible) for JWT sign/verify
- HS256 algorithm, 7-day expiry, HttpOnly cookie `nexusboard_token`
- Middleware protects all routes except: `/login`, `/register`, `/api/auth/*`
- `requireAuth()` throws "Unauthorized" — caught in route handlers
- Session helper `getSession()` reads the cookie and verifies

---

## API Routes Summary

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account (email+password+name, bcrypt) |
| POST | `/api/auth/login` | Login with credentials |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/me` | Update profile |
| POST | `/api/auth/logout` | Clear cookie |
| GET | `/api/workspaces` | List user's workspaces |
| POST | `/api/workspaces` | Create workspace (+ auto-join as OWNER) |
| GET | `/api/workspaces/[id]` | Get workspace with members |
| PATCH | `/api/workspaces/[id]` | Update (owner only) |
| DELETE | `/api/workspaces/[id]` | Delete (owner only) |
| GET | `/api/tasks?workspaceId=X&status=Y` | List/filter tasks |
| POST | `/api/tasks` | Create task in workspace |
| GET | `/api/tasks/[id]` | Get task with comments |
| PATCH | `/api/tasks/[id]` | Update task fields |
| PATCH | `/api/tasks/[id]/status` | Update status only |
| DELETE | `/api/tasks/[id]` | Delete task |
| GET | `/api/tasks/[id]/comments` | List comments |
| POST | `/api/tasks/[id]/comments` | Add comment |
| GET | `/api/notifications` | List user's notifications |
| PATCH | `/api/notifications/[id]/read` | Mark notification read |

All inputs validated with Zod schemas. All errors return `{ error: string }` with appropriate status codes.

---

## Frontend

- **Login/Register**: Forms with client-side validation, redirect to / on success
- **Dashboard**: Workspace list with create form, member/task counts, grid cards
- **Kanban Board**: 4 columns (TODO, IN_PROGRESS, REVIEW, DONE), drag-drop to change status, create task dialog
- **Settings**: Profile editor (name), account info display
- **Dark mode**: Full dark mode support via Tailwind `dark:` variants

---

## Environment Variables

```
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

---

## Commands

```bash
npm run dev      # Start dev server (needs prisma generate first)
npm run build    # Production build
npm run start    # Start production server
npx prisma db push  # Push schema to database
```

---

## Key Technical Decisions

1. **Prisma v7**: Uses `prisma.config.ts` + `@prisma/adapter-pg` driver adapter. The `url` in schema datasource was removed.
2. **Zod v4**: Error access changed from `.errors` to `.issues`.
3. **jose**: Used instead of jsonwebtoken for Edge Runtime compatibility (though middleware currently uses Node.js).
4. **Next.js 16**: Route handlers use `params: Promise<{id}>` with `await params` for dynamic segments.
5. **Tailwind v4**: Uses `@import "tailwindcss"` in globals.css instead of `@tailwind` directives.
