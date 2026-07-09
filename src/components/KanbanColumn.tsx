"use client";

import { TaskCard } from "./TaskCard";
import { Badge } from "./ui/Badge";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  assignee?: { id: string; name: string; email: string } | null;
  _count?: { comments: number };
  dueDate?: string | null;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  TODO: { label: "To Do", color: "border-t-slate-400" },
  IN_PROGRESS: { label: "In Progress", color: "border-t-indigo-500" },
  REVIEW: { label: "Review", color: "border-t-purple-500" },
  DONE: { label: "Done", color: "border-t-green-500" },
};

interface KanbanColumnProps {
  status: string;
  tasks: Task[];
  onDrop: (taskId: string, status: string) => void;
  onTaskClick?: (task: Task) => void;
}

export function KanbanColumn({ status, tasks, onDrop, onTaskClick }: KanbanColumnProps) {
  const config = statusConfig[status] || { label: status, color: "border-t-slate-400" };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) onDrop(taskId, status);
  };

  return (
    <div
      className={`flex w-72 flex-shrink-0 flex-col rounded-xl border-t-2 bg-slate-100 ${config.color}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-700">
          {config.label}
        </h3>
        <Badge variant="default">{tasks.length}</Badge>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto px-3 pb-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick?.(task)}
            onDragStart={(e, t) => {
              e.dataTransfer.setData("text/plain", t.id);
            }}
          />
        ))}
        {tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
