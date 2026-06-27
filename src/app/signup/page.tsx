import { signUp } from "@/lib/supabase/actions";
import Link from "next/link";

export default async function SignupPage({
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
            Your spending,
            <br />
            categorized automatically.
          </p>
          <p className="mt-4 max-w-sm text-sm text-slate-400">
            Rule-based matching handles the obvious cases instantly; a local
            AI model fills in the rest — all running on infrastructure that
            costs you nothing.
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
              Finance Assistant
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-[var(--text-tertiary)]">
            Start tracking your spending with AI-powered insights.
          </p>

          {error && (
            <p className="mt-5 rounded-[var(--radius-sm)] border border-[var(--negative)]/20 bg-[var(--negative-soft)] px-3.5 py-2.5 text-sm text-[var(--negative)]">
              {error}
            </p>
          )}

          <form action={signUp} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                Display name
              </label>
              <input
                type="text"
                name="displayName"
                required
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
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
                minLength={6}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-on)] shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--accent-strong)] hover:shadow-[var(--shadow-glow)] active:scale-[0.99]"
            >
              Sign up
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-tertiary)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--accent-strong)] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}