"use client";
import { useEffect, useState } from "react";

export default function PlanBadge({ className }: { className?: string }) {
  const [text, setText] = useState("Checking…");

  useEffect(() => {
    let alive = true;
    fetch("/api/profile/plan", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        const plan = String(d?.plan ?? "free").toLowerCase();
        setText(plan === "free" ? "Free — Upgrade" : plan.toUpperCase());
      })
      .catch(() => alive && setText("Free — Upgrade"));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <a
      href="/settings/billing"
      className={`rounded-full border px-3 py-1 text-sm ${className ?? ""}`}
    >
      {text}
    </a>
  );
}
