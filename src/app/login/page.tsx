import type { Metadata } from "next";
import { LoginForm } from "@/components/commerce/auth-forms";
import { CommerceShell } from "@/components/commerce/commerce-shell";

export const metadata: Metadata = { title: "Sign In", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return <CommerceShell eyebrow="Customer account" title="Welcome back" description="Your orders and delivery details, in one place."><div className="mx-auto max-w-xl"><LoginForm nextPath={params.next} /></div></CommerceShell>;
}
