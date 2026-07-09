"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const linkClass = (href: string) =>
    `rounded-lg px-3 py-1.5 text-sm transition-colors ${
      pathname === href
        ? "bg-indigo-600 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-slate-900">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-white">
            NexusBoard
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <Link href="/" className={linkClass("/")}>
              Workspaces
            </Link>
            <Link href="/settings" className={linkClass("/settings")}>
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-300 sm:inline">
            {user.name}
          </span>
          <Avatar name={user.name} size="sm" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {loggingOut ? "..." : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  );
}
