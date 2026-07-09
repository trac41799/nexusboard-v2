"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          setName(data.user.name);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setMessage("Profile updated successfully");
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to update profile");
      }
    } catch {
      setMessage("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Settings
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <div className="mb-6 flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              {user.name}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {user.email}
            </p>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Display Name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            id="email"
            value={user.email}
            disabled
          />
          {message && (
            <div
              className={`rounded-lg p-3 text-sm ${
                message.includes("success")
                  ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {message}
            </div>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              Member since:{" "}
            </span>
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              User ID:{" "}
            </span>
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              {user.id}
            </code>
          </p>
        </div>
      </Card>
    </div>
  );
}
