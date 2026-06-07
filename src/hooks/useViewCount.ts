"use client";

import { useEffect, useState } from "react";

export function useViewCount(contentId: string, initialCount: number) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    fetch(`/api/views/${contentId}`, { method: "POST" })
      .then((r) => r.json())
      .then((d) => { if (typeof d.count === "number") setCount(d.count); })
      .catch(() => {});
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return count;
}
