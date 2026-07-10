"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

const priorityColors: Record<string, "warning" | "danger" | "info" | "default"> = {
  LOW: "info",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "danger",
};

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
  creator?: User | null;
  _count?: { comments: number };
  dueDate?: string | null;
  saving?: boolean;
}

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
}

export function TaskCard({ task, onClick, draggable = true, onDragStart }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    setExpanded((prev) => !prev);
    onClick?.();
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (task.saving) {
      e.preventDefault();
      return;
    }
    if (onDragStart) onDragStart(e, task);
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className={`rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
        task.saving
          ? "cursor-default border-indigo-300 opacity-60"
          : "cursor-pointer border-slate-200"
      } ${draggable && !task.saving ? "active:cursor-grabbing" : ""}`}
      onClick={handleClick}
      draggable={draggable && !task.saving}
      onDragStart={handleDragStart}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-slate-900 truncate">
            {task.title}
          </h4>
          {task.saving && (
            <span className="mt-0.5 inline-flex items-center text-xs text-indigo-500">
              <span className="mr-1 inline-block h-2.5 w-2.5 animate-spin rounded-full border border-indigo-500 border-t-transparent" />
              saving...
            </span>
          )}
        </div>
        <Badge variant={priorityColors[task.priority] || "default"}>
          {task.priority}
        </Badge>
      </div>

      {task.description && !task.saving && (
        <p
          className={`mt-1.5 text-xs text-slate-500 ${
            expanded ? "" : "line-clamp-2"
          }`}
        >
          {task.description}
        </p>
      )}

      {expanded && !task.saving && (
        <div className="mt-2 border-t border-slate-100 pt-2">
          {task.creator && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="shrink-0">Created by:</span>
              <Avatar name={task.creator.name} size="sm" />
              <span>{task.creator.name}</span>
            </div>
          )}
          {task.dueDate && (
            <div className="mt-1 text-xs text-slate-500">
              Due: {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </div>
          )}
          {task._count && task._count.comments > 0 && (
            <div className="mt-1 text-xs text-slate-500">
              {task._count.comments} comment{task._count.comments !== 1 ? "s" : ""}
            </div>
          )}
        </div>
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
          {!task.saving && (
            <span className="text-[10px] text-slate-300">
              {expanded ? "click to collapse" : "click to expand"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
