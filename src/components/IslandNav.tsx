"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, PlaySquare, Upload } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/library",
    label: "Library",
    icon: Library,
    match: (p: string) => p.startsWith("/library"),
  },
  {
    href: "/admin",
    label: "Add",
    icon: Upload,
    match: (p: string) => p.startsWith("/admin"),
  },
] as const;

export default function IslandNav() {
  const pathname = usePathname();

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      aria-label="Main"
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-zinc-700/60 bg-zinc-900/85 p-1.5 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-xl sm:gap-1.5 sm:p-2">
        <Link
          href="/"
          className="mr-0.5 flex items-center gap-2 rounded-full px-2 py-1.5 sm:px-3"
          aria-label="Nexora home"
        >
          <PlaySquare className="h-6 w-6 shrink-0 text-violet-500 sm:h-7 sm:w-7" />
          <span className="hidden bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-sm font-bold text-transparent sm:inline">
            Nexora
          </span>
        </Link>

        <span className="mx-0.5 h-6 w-px bg-zinc-700/80" aria-hidden />

        {links.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition sm:px-4 ${
                active
                  ? "bg-violet-600 text-white shadow-md shadow-violet-900/40"
                  : "text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="max-[420px]:sr-only">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
