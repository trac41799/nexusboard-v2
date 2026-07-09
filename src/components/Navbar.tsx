"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";

interface NavbarProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            NexusBoard
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              Workspaces
            </Link>
            <Link
              href="/settings"
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-zinc-600 dark:text-zinc-400 sm:inline">
            {user.name}
          </span>
          <Avatar name={user.name} size="sm" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "..." : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  );
}
