"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

const priorityColors: Record<string, "warning" | "danger" | "info" | "default"> = {
  LOW: "info",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "danger",
};

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

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
}

export function TaskCard({ task, onClick, draggable = true, onDragStart }: TaskCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) onDragStart(e, task);
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className={`cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
        draggable ? "active:cursor-grabbing" : ""
      }`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={handleDragStart}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-900">
          {task.title}
        </h4>
        <Badge variant={priorityColors[task.priority] || "default"}>
          {task.priority}
        </Badge>
      </div>
      {task.description && (
        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
          {task.description}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between">
        {task.assignee ? (
          <Avatar name={task.assignee.name} size="sm" />
        ) : (
          <span className="text-xs text-slate-400">Unassigned</span>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {task._count ? (
            <span>{task._count.comments} comments</span>
          ) : null}
          {task.dueDate && (
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
