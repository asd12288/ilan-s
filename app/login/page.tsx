import { redirect } from "next/navigation";

import { hasSession } from "@/features/auth/session";
import { LoginForm } from "@/features/auth/login-form";

export default async function LoginPage() {
  if (await hasSession()) redirect("/");

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <section className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="mb-8 text-2xl font-semibold tracking-[-0.025em]">לימודים</h1>
        <LoginForm />
      </section>
    </main>
  );
}
