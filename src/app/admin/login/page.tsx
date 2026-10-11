import { ThemeSwitch } from "@/components/theme/theme-switch";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";
import { AdminLoginForm } from "./login-form";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === "ADMIN") redirect("/admin");
  const configured = Boolean(
    process.env.ADMIN_EMAIL &&
      (process.env.ADMIN_PASSWORD_HASH || (process.env.NODE_ENV !== "production" && process.env.ADMIN_PASSWORD)),
  );

  return (
    <main className="admin-login flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <section className="w-full max-w-md rounded-xl border border-line bg-surface p-7 shadow-sm sm:p-10">
        <div className="mb-5 flex justify-end"><ThemeSwitch /></div>
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-lg bg-neutral-900 text-white"><ShieldCheck aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-medium text-muted">Pak Multilinks</p>
            <h1 className="text-2xl font-bold tracking-tight text-content">Log in to your store</h1>
          </div>
        </div>
        <p className="mb-7 text-sm leading-6 text-secondary">Sign in to manage products, inventory, orders, quotation requests, and store details.</p>
        {!configured && (
          <div role="status" className="mb-6 rounded-2xl border border-warning-line bg-warning-soft p-4 text-sm leading-6 text-warning">
            Admin sign-in is not configured. Set <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD_HASH</code>. During local development only, <code>ADMIN_PASSWORD</code> may replace the hash.
          </div>
        )}
        <AdminLoginForm disabled={!configured} />
        <Link href="/" className="mt-7 block text-center text-sm font-semibold text-secondary hover:underline">Return to storefront</Link>
      </section>
    </main>
  );
}
