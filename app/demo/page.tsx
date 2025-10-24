"use client";
import { useTransition } from "react";
import { demoSignIn } from "./signInAction";

export default function DemoPage() {
  const [pending, start] = useTransition();
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <button
        onClick={() => start(async () => { await demoSignIn(); })}
        className="px-4 py-2 rounded-md border"
        disabled={pending}
      >
        {pending ? "Signing in…" : "Login as Demo"}
      </button>
    </div>
  );
}
