"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  _count: { members: number; tasks: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const fetchWorkspaces = () => {
    fetch("/api/workspaces")
      .then((res) => res.json())
      .then((data) => setWorkspaces(data.workspaces || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create workspace");
      return;
    }

    setName("");
    setShowCreate(false);
    fetchWorkspaces();
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Your Workspaces
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your team workspaces and projects
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>New Workspace</Button>
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Workspace</CardTitle>
          </CardHeader>
          <form onSubmit={handleCreate} className="flex items-end gap-3">
            <Input
              label="Workspace Name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing Team"
              error={error}
            />
            <Button type="submit">Create</Button>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setShowCreate(false);
                setError("");
              }}
            >
              Cancel
            </Button>
          </form>
        </Card>
      )}

      {workspaces.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-slate-500">
            No workspaces yet. Create your first workspace to get started.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <Link key={ws.id} href={`/workspaces/${ws.id}`}>
              <Card className="h-full transition-shadow hover:shadow-xl">
                <h3 className="text-lg font-semibold text-slate-900">
                  {ws.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  /{ws.slug}
                </p>
                <div className="mt-4 flex gap-2">
                  <Badge variant="default">{ws._count.members} members</Badge>
                  <Badge variant="info">{ws._count.tasks} tasks</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
