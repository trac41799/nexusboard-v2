# Supabase Migration Handoff

## What changed

Replaced Prisma ORM with `@supabase/supabase-js` client across the entire backend.

## Deleted files

- `prisma/schema.prisma`
- `prisma.config.ts`
- `prisma/` directory
- `src/lib/prisma.ts`

## Created files

- `src/lib/supabase.ts` — Supabase JS client singleton

## Rewritten files

### Auth routes
- `src/app/api/auth/register/route.ts` — `supabase.from('users').select/insert`
- `src/app/api/auth/login/route.ts` — `supabase.from('users').select`
- `src/app/api/auth/me/route.ts` — `supabase.from('users').select/update`

### Data layer
- `src/lib/tasks.ts` — `supabase.from('tasks').select/insert/update/delete`, `supabase.from('comments').*`, `supabase.from('notifications').*`
- `src/lib/workspaces.ts` — `supabase.from('workspaces').select/insert/update/delete`, `supabase.from('workspace_members').*`

## Key mapping: Prisma → Supabase JS

| Prisma | Supabase JS |
|--------|-------------|
| `getPrisma().user.findUnique({ where: { email } })` | `supabase.from('users').select().eq('email', email).maybeSingle()` |
| `getPrisma().user.create({ data })` | `supabase.from('users').insert(data).select().single()` |
| `getPrisma().user.update({ where, data })` | `supabase.from('users').update(data).eq('id', id).select().single()` |
| `getPrisma().task.findMany({ where, include, orderBy })` | `supabase.from('tasks').select().eq(...).order(...)` + separate user/comment queries |
| `getPrisma().workspace.create({ data: { members: { create } } })` | Two inserts: `workspaces` then `workspace_members` |
| `include: { creator: ..., assignee: ... }` | Separate `getUserRef()` queries batched via `.in('id', ids)` |
| `_count: { select: { comments: true } }` | `.select('*', { count: 'exact', head: true })` |

## Table names (from Prisma @map)

| Model | Table |
|-------|-------|
| User | `users` |
| Workspace | `workspaces` |
| WorkspaceMember | `workspace_members` |
| Task | `tasks` |
| Comment | `comments` |
| Notification | `notifications` |

## Column naming

Columns use Prisma's camelCase convention (e.g. `passwordHash`, `creatorId`, `workspaceId`, `dueDate`, `createdAt`).

## Environment

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key

## Notes

- Relation data (creator/assignee on tasks, author on comments, members on workspaces) is fetched via separate batched queries instead of Prisma's `include`.
- Nested creates (workspace + member) are done as two sequential inserts since Supabase REST API doesn't support transactions.
- `_count` replaced with explicit `.select('*', { count: 'exact', head: true })` count queries.
