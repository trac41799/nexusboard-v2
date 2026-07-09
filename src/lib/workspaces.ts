import { getPrisma } from "./prisma";

export async function createWorkspace(data: {
  name: string;
  slug: string;
  ownerId: string;
}) {
  const workspace = await getPrisma().workspace.create({
    data: {
      name: data.name,
      slug: data.slug,
      ownerId: data.ownerId,
      members: {
        create: {
          userId: data.ownerId,
          role: "OWNER",
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });
  return workspace;
}

export async function getUserWorkspaces(userId: string) {
  const memberships = await getPrisma().workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          _count: { select: { members: true, tasks: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });
  return memberships.map((m) => m.workspace);
}

export async function getWorkspaceById(id: string) {
  return (await getPrisma()).workspace.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      _count: { select: { tasks: true } },
    },
  });
}

export async function updateWorkspace(id: string, data: { name?: string; slug?: string }) {
  return (await getPrisma()).workspace.update({
    where: { id },
    data,
  });
}

export async function deleteWorkspace(id: string) {
  return (await getPrisma()).workspace.delete({ where: { id } });
}

export async function isWorkspaceMember(userId: string, workspaceId: string) {
  const member = await getPrisma().workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  return !!member;
}
