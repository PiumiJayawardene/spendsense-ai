import { signIn } from "@/lib/supabase/actions";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-[var(--navy-950)] p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-base font-bold text-[var(--accent-on)]">
            ₣
          </span>
          <span className="text-sm font-semibold">SpendSense AI</span>
        </div>
        <div>
          <p className="text-3xl font-semibold leading-tight tracking-tight">
           AI-Powered
            <br />
            Personal Finance Assistant
          </p>
          <p className="mt-4 max-w-sm text-sm text-slate-400">
            Upload a statement, get instant categorization, and ask your own
            transaction history questions in plain English.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Built with Next.js, Supabase, and a local-first AI pipeline.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[var(--bg-app)] px-4 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-base font-bold text-[var(--accent-on)]">
              ₣
            </span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              SpendSense AI
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-[var(--text-tertiary)]">
            Log in to your finance assistant.
          </p>

          {error && (
            <p className="mt-5 rounded-[var(--radius-sm)] border border-[var(--negative)]/20 bg-[var(--negative-soft)] px-3.5 py-2.5 text-sm text-[var(--negative)]">
              {error}
            </p>
          )}

          <form action={signIn} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-on)] shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--accent-strong)] hover:shadow-[var(--shadow-glow)] active:scale-[0.99]"
            >
              Log in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-tertiary)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-[var(--accent-strong)] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}