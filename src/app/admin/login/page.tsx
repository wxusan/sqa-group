"use client";

import { useActionState } from "react";
import Image from "next/image";
import { loginAction } from "@/lib/actions";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm bg-white p-8">
        <div className="flex flex-col items-center">
          <Image src="/images/logo/logo-black.jpg" alt="SQA Group" width={64} height={64} className="rounded-card" />
          <h1 className="mt-4 text-lg font-bold">Administrator sign in</h1>
        </div>
        <form action={action} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Login</span>
            <input
              name="email"
              type="text"
              required
              autoComplete="username"
              className="w-full rounded-card border border-line px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-card border border-line px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          {state?.error && (
            <p className="rounded-card border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-card bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-bright disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
