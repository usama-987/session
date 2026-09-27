import { LoginForm } from "@/components/common/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden px-4 py-10">
      <div className="login-backdrop" aria-hidden="true" />

      <section className="relative z-10 w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <p className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--brand)] sm:text-5xl">
            Session
          </p>
          <h1 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Use your admin or assigned user credentials to continue.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_20px_50px_-28px_rgba(15,61,62,0.45)] backdrop-blur-sm sm:p-8">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
