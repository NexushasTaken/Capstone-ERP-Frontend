"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import SessionExpiredPage from "@/app/dashboard/_components/SessionExpiredPage";
import AccessDeniedPage from "@/app/dashboard/_components/AccessDeniedPage";
import ErrorPage from "@/app/dashboard/_components/ErrorPage";
import Loading from "@/components/Loading";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { can } from "@/lib/permissions";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  // Same source as the sidebar, so a visible link always opens its page.
  const { data: currentUser } = useCurrentUser();

  const [status, setStatus] = useState<
    "loading" | "authorized" | "unauthorized" | "forbidden" | "error"
  >("loading");

  useEffect(() => {
    let cancelled = false;

    async function authorize() {
      try {
        const response = await fetch("/api/View/authorize", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (cancelled) return;

        if (response.status === 401) {
          setStatus("unauthorized");
          return;
        }

        if (response.status === 403) {
          setStatus("forbidden");
          return;
        }

        if (!response.ok) {
          setStatus("error");
          return;
        }

        setStatus("authorized");
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    authorize();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (status === "loading") {
    return <div className="flex h-screen"><Loading /></div>;
  }

  if (status === "unauthorized") {
    return <SessionExpiredPage />;
  }

  if (status === "forbidden") {
    return <AccessDeniedPage />;
  }

  if (status === "error") {
    return <ErrorPage />;
  }

  // Checked on every render (not in the effect) so a restricted page never flashes
  // while the authorize request for the new pathname is still running.
  if (!can(currentUser?.role, pathname)) {
    return <AccessDeniedPage reason="role" />;
  }

  return <>{children}</>;
}
