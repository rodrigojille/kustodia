"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only protect routes other than /login
    if (pathname === "/login") return;
    const hasSession = document.cookie.includes("token=") || localStorage.getItem("token");
    if (!hasSession) {
      router.replace("/login");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
