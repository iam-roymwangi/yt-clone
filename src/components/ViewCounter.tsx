"use client";

import { Eye } from "lucide-react";
import { useViewCount } from "@/hooks/useViewCount";
import { formatViewCount } from "@/lib/view-counts";

export default function ViewCounter({ contentId, initialCount }: { contentId: string; initialCount: number }) {
  const count = useViewCount(contentId, initialCount);
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-zinc-500">
      <Eye className="h-4 w-4" />
      {formatViewCount(count)} view{count !== 1 ? "s" : ""}
    </span>
  );
}
