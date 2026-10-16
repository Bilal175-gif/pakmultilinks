"use client";

import { usePathname } from "next/navigation";

import { SalesContactProvider } from "@/components/commerce/sales-contact";
import { StoreProvider } from "@/components/providers/store-provider";

import { Footer } from "./footer";
import { FloatingSupport } from "./floating-support";
import { Header } from "./header";
import { MobileSalesBar } from "./mobile-sales-bar";
import { MobileFooter } from "./mobile-footer";

export function RouteShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return <div id="main-content">{children}</div>;
  }

  return (
    <SalesContactProvider>
      <StoreProvider>
        <div className="storefront-shell">
          <Header />
          <main id="main-content" className="min-h-[60vh]">
            {children}
          </main>
          <Footer />
          <FloatingSupport />
          <MobileSalesBar />
        </div>
      </StoreProvider>
    </SalesContactProvider>
  );
}
