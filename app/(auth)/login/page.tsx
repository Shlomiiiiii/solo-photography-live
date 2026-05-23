import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Admin Login"
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-3xl bg-white text-ink shadow-glow">
            <span className="text-xl font-semibold">S</span>
          </div>
          <p className="text-sm uppercase tracking-[0.28em] text-white/35">Admin only</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">{APP_NAME}</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">Secure studio operations for private client galleries, payments, and delivery.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}

