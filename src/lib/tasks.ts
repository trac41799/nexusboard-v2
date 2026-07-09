import { getSupabase } from "./supabase";

type UserRef = { id: string; name: string; email: string } | null;

async function getUserRef(userId: string | null): Promise<UserRef> {
  if (!userId) return null;
  const { data } = await getSupabase()
    .from('users')
    .select('id, name, email')
    .eq('id', userId)
    .maybeSingle();
  return data;
}

export async function createTask(data: {
  title: string;
  description?: string;
  priority?: string;
  workspaceId: string;
  creatorId: string;
  assigneeId?: string;
  dueDate?: string;
}) {
  const { data: task, error } = await getSupabase()
    .from('tasks')
    .insert({
      title: data.title,
      description: data.description,
      priority: data.priority || "MEDIUM",
      workspaceId: data.workspaceId,
      creatorId: data.creatorId,
      assigneeId: data.assigneeId || null,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    })
    .select('*')
    .single();

  if (error) throw error;

  const [creator, assignee] = await Promise.all([
    getUserRef(task.creatorId),
    getUserRef(task.assigneeId),
  ]);

  const { count } = await getSupabase()
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('taskId', task.id);

  return { ...task, creator, assignee, _count: { comments: count ?? 0 } };
}

export async function getTasks(filters: {
  workspaceId: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
}) {
  let query = getSupabase().from('tasks').select('*');

  query = query.eq('workspaceId', filters.workspaceId);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.priority) query = query.eq('priority', filters.priority);
  if (filters.assigneeId) query = query.eq('assigneeId', filters.assigneeId);

  query = query.order('createdAt', { ascending: false });

  const { data: tasks, error } = await query;
  if (error) throw error;
  if (!tasks) return [];

  const userIds = [
    ...new Set(
      tasks.flatMap((t) => [t.creatorId, t.assigneeId].filter(Boolean))
    ),
  ] as string[];

  const { data: users } = await getSupabase()
    .from('users')
    .select('id, name, email')
    .in('id', userIds);

  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  const taskIds = tasks.map((t) => t.id);
  const { data: commentCounts } = await getSupabase()
    .from('comments')
    .select('taskId')
    .in('taskId', taskIds);

  const countMap = new Map<string, number>();
  (commentCounts ?? []).forEach((c) => {
    countMap.set(c.taskId, (countMap.get(c.taskId) ?? 0) + 1);
  });

  return tasks.map((task) => ({
    ...task,
    creator: userMap.get(task.creatorId) ?? null,
    assignee: userMap.get(task.assigneeId) ?? null,
    _count: { comments: countMap.get(task.id) ?? 0 },
  }));
}

export async function getTaskById(id: string) {
  const { data: task, error } = await getSupabase()
    .from('tasks')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!task) return null;

  const [creator, assignee, comments] = await Promise.all([
    getUserRef(task.creatorId),
    getUserRef(task.assigneeId),
    getComments(task.id),
  ]);

  return { ...task, creator, assignee, comments };
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
    updateData.dueDate = data.dueDate ? new Date(data.dueDate).toISOString() : null;

  const { data: task, error } = await getSupabase()
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  const [creator, assignee] = await Promise.all([
    getUserRef(task.creatorId),
    getUserRef(task.assigneeId),
  ]);

  const { count } = await getSupabase()
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('taskId', task.id);

  return { ...task, creator, assignee, _count: { comments: count ?? 0 } };
}

export async function updateTaskStatus(id: string, status: string) {
  const { data: task, error } = await getSupabase()
    .from('tasks')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  const [creator, assignee] = await Promise.all([
    getUserRef(task.creatorId),
    getUserRef(task.assigneeId),
  ]);

  const { count } = await getSupabase()
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('taskId', task.id);

  return { ...task, creator, assignee, _count: { comments: count ?? 0 } };
}

export async function deleteTask(id: string) {
  const { error } = await getSupabase().from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function createComment(data: {
  content: string;
  taskId: string;
  authorId: string;
}) {
  const { data: comment, error } = await getSupabase()
    .from('comments')
    .insert({
      content: data.content,
      taskId: data.taskId,
      authorId: data.authorId,
    })
    .select('*')
    .single();

  if (error) throw error;

  const author = await getUserRef(comment.authorId);

  return { ...comment, author };
}

export async function getComments(taskId: string) {
  const { data: comments, error } = await getSupabase()
    .from('comments')
    .select('*')
    .eq('taskId', taskId)
    .order('createdAt', { ascending: true });

  if (error) throw error;
  if (!comments) return [];

  const authorIds = [...new Set(comments.map((c) => c.authorId))];
  const { data: users } = await getSupabase()
    .from('users')
    .select('id, name, email')
    .in('id', authorIds);

  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  return comments.map((comment) => ({
    ...comment,
    author: userMap.get(comment.authorId) ?? null,
  }));
}

export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}) {
  const { data: notification, error } = await getSupabase()
    .from('notifications')
    .insert(data)
    .select('*')
    .single();

  if (error) throw error;
  return notification;
}

export async function getUserNotifications(userId: string) {
  const { data: notifications, error } = await getSupabase()
    .from('notifications')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return notifications ?? [];
}

export async function markNotificationRead(id: string) {
  const { data: notification, error } = await getSupabase()
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return notification;
}
