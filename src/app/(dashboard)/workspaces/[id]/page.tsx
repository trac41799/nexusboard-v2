"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { KanbanColumn } from "@/components/KanbanColumn";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";

const STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

interface User {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  assignee?: User | null;
  _count?: { comments: number };
  dueDate?: string | null;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  _count: { tasks: number };
}

export default function WorkspacePage() {
  const params = useParams();
  const id = params.id as string;
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchTasks = useCallback(() => {
    fetch(`/api/tasks?workspaceId=${id}`)
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks || []));
  }, [id]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/workspaces/${id}`).then((r) => r.json()),
      fetch(`/api/tasks?workspaceId=${id}`).then((r) => r.json()),
    ])
      .then(([wsData, taskData]) => {
        setWorkspace(wsData.workspace);
        setTasks(taskData.tasks || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDrop = async (taskId: string, newStatus: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const res = await fetch(`/api/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      const data = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
    }
  };

  const handleCreateTask = async (data: {
    title: string;
    description?: string;
    priority: string;
  }) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, workspaceId: id }),
    });

    if (res.ok) {
      const d = await res.json();
      setTasks((prev) => [d.task, ...prev]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Workspace not found.</p>
      </div>
    );
  }

  const columns = STATUSES.map((status) => ({
    status,
    tasks: tasks.filter((t) => t.status === status),
  }));

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {workspace.name}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="default">{workspace.slug}</Badge>
              <span className="text-sm text-slate-500">
                {workspace._count.tasks} tasks
              </span>
            </div>
          </div>
          <Button onClick={() => setShowCreate(true)}>New Task</Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="mx-auto flex w-fit gap-4">
          {columns.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              tasks={col.tasks}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>

      <CreateTaskDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreateTask}
      />
    </div>
  );
}
