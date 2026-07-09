import { prisma } from "./prisma";

export async function createTask(data: {
  title: string;
  description?: string;
  priority?: string;
  workspaceId: string;
  creatorId: string;
  assigneeId?: string;
  dueDate?: string;
}) {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority || "MEDIUM",
      workspaceId: data.workspaceId,
      creatorId: data.creatorId,
      assigneeId: data.assigneeId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      _count: { select: { comments: true } },
    },
  });
  return task;
}

export async function getTasks(filters: {
  workspaceId: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
}) {
  const where: Record<string, unknown> = {
    workspaceId: filters.workspaceId,
  };
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assigneeId) where.assigneeId = filters.assigneeId;

  return prisma.task.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function updateTask(
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assigneeId?: string | null;
    dueDate?: string | null;
  }
) {
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
  if (data.dueDate !== undefined)
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

  return prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      creator: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      _count: { select: { comments: true } },
    },
  });
}

export async function updateTaskStatus(id: string, status: string) {
  return prisma.task.update({
    where: { id },
    data: { status },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      _count: { select: { comments: true } },
    },
  });
}

export async function deleteTask(id: string) {
  return prisma.task.delete({ where: { id } });
}

export async function createComment(data: {
  content: string;
  taskId: string;
  authorId: string;
}) {
  return prisma.comment.create({
    data: {
      content: data.content,
      taskId: data.taskId,
      authorId: data.authorId,
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getComments(taskId: string) {
  return prisma.comment.findMany({
    where: { taskId },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}) {
  return prisma.notification.create({ data });
}

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
}
