"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import SessionExpiredPage from "@/app/components/auth/SessionExpiredPage";
import AccessDeniedPage from "@/app/components/auth/AccessDeniedPage";
import ErrorPage from "@/app/components/auth/ErrorPage";
import Loading from "@/app/components/loaders/Loading";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();

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

        setStatus("loading");
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
    return <Loading />;
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

  return <>{children}</>;
}
