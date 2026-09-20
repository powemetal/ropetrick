"use client";

import { useTransition } from "react";

export function CloneMonsterButton({ action, direction }: { action: (data: { direction: "up" | "down" }) => Promise<unknown>; direction: "up" | "down" }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await action({ direction });
        })
      }
      className="mt-4 rounded border border-[var(--theme-accent)] px-3 py-1 text-xs font-semibold text-[var(--theme-accent)]"
    >
      {pending ? "Clonage..." : direction === "up" ? "Cloner + échelle" : "Cloner - échelle"}
    </button>
  );
}
