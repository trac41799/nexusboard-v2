import { getSupabase } from "./supabase";

export async function createWorkspace(data: {
  name: string;
  slug: string;
  ownerId: string;
}) {
  const { data: workspace, error } = await getSupabase()
    .from('workspaces')
    .insert({
      name: data.name,
      slug: data.slug,
      ownerId: data.ownerId,
    })
    .select('*')
    .single();

  if (error) throw error;

  const { data: member } = await getSupabase()
    .from('workspace_members')
    .insert({
      userId: data.ownerId,
      workspaceId: workspace.id,
      role: "OWNER",
    })
    .select('*, user:users(id, name, email)')
    .single();

  return { ...workspace, members: member ? [member] : [] };
}

export async function getUserWorkspaces(userId: string) {
  const { data: memberships, error } = await getSupabase()
    .from('workspace_members')
    .select('workspaceId, joinedAt')
    .eq('userId', userId)
    .order('joinedAt', { ascending: false });

  if (error) throw error;
  if (!memberships) return [];

  const workspaceIds = memberships.map((m) => m.workspaceId);
  if (workspaceIds.length === 0) return [];

  const { data: workspaces } = await getSupabase()
    .from('workspaces')
    .select('*')
    .in('id', workspaceIds);

  if (!workspaces) return [];

  const memberCounts = await Promise.all(
    workspaceIds.map(async (wid) => {
      const { count } = await getSupabase()
        .from('workspace_members')
        .select('*', { count: 'exact', head: true })
        .eq('workspaceId', wid);
      return { wid, count: count ?? 0 };
    })
  );

  const taskCounts = await Promise.all(
    workspaceIds.map(async (wid) => {
      const { count } = await getSupabase()
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('workspaceId', wid);
      return { wid, count: count ?? 0 };
    })
  );

  const memberCountMap = new Map(memberCounts.map((m) => [m.wid, m.count]));
  const taskCountMap = new Map(taskCounts.map((t) => [t.wid, t.count]));

  return workspaces.map((ws) => ({
    ...ws,
    _count: {
      members: memberCountMap.get(ws.id) ?? 0,
      tasks: taskCountMap.get(ws.id) ?? 0,
    },
  }));
}

export async function getWorkspaceById(id: string) {
  const { data: workspace, error } = await getSupabase()
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!workspace) return null;

  const { data: members } = await getSupabase()
    .from('workspace_members')
    .select('*, user:users(id, name, email)')
    .eq('workspaceId', id);

  const { count } = await getSupabase()
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('workspaceId', id);

  return { ...workspace, members: members ?? [], _count: { tasks: count ?? 0 } };
}

export async function updateWorkspace(
  id: string,
  data: { name?: string; slug?: string }
) {
  const { data: workspace, error } = await getSupabase()
    .from('workspaces')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return workspace;
}

export async function deleteWorkspace(id: string) {
  const { error } = await getSupabase().from('workspaces').delete().eq('id', id);
  if (error) throw error;
}

export async function isWorkspaceMember(userId: string, workspaceId: string) {
  const { data: member } = await getSupabase()
    .from('workspace_members')
    .select('id')
    .eq('userId', userId)
    .eq('workspaceId', workspaceId)
    .maybeSingle();

  return !!member;
}
