"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export default function StagePath({
  id,
  current,
  stages,
}: {
  id: string;
  current: string;
  stages: string[];
}) {
  const [optimistic, setOptimistic] = useState(current);
  const [pending, start] = useTransition();

  async function setStage(s: string) {
    const prev = optimistic;
    setOptimistic(s);
    const ok = await fetch(`/api/opportunities/${id}/stage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stage: s }),
    }).then((r) => r.ok).catch(() => false);
    if (!ok) setOptimistic(prev);
  }

  return (
    <div className="flex flex-wrap gap-2 px-1">
      {stages.map((s, i) => {
        const isCurrent = s === optimistic;
        const currentIdx = stages.indexOf(optimistic);
        const isDone = i < currentIdx;
        return (
          <Button
            key={s}
            size="sm"
            variant={isCurrent ? "default" : isDone ? "secondary" : "outline"}
            disabled={pending}
            onClick={() => start(() => setStage(s))}
          >
            {s}
          </Button>
        );
      })}
    </div>
  );
}
