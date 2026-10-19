"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageTopLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 750);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div
      aria-hidden="true"
      className="page-top-loader pointer-events-none fixed left-0 right-0 top-0 z-[9999] h-[2.5px] origin-left bg-gradient-to-r from-[#114b2f] via-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
    />
  );
}
