"use client";

import { useEffect, useState } from "react";
import { getDeadlineResult, DEADLINE_STYLES, type DeadlineResult } from "@/lib/sla";

interface Props {
  priority:  string;
  createdAt: string;
  status:    string;
  showBar?:  boolean;
}

export function SLABadge({ priority, createdAt, status, showBar = false }: Props) {
  const [result, setResult] = useState<DeadlineResult | null>(() =>
    getDeadlineResult(priority, createdAt, status)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setResult(getDeadlineResult(priority, createdAt, status));
    }, 60_000);
    return () => clearInterval(id);
  }, [priority, createdAt, status]);

  if (!result) return null;

  const style    = DEADLINE_STYLES[result.status];
  const pctCapped = Math.min(result.percentElapsed, 100);
  const barColor  =
    result.status === "on_track" ? "bg-green-500" :
    result.status === "at_risk"  ? "bg-yellow-400" : "bg-red-500";

  return (
    <div className="space-y-1.5">
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${style.bg} ${style.text} ${style.ring}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {result.label}
      </span>

      {showBar && (
        <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pctCapped}%` }}
          />
        </div>
      )}
    </div>
  );
}
