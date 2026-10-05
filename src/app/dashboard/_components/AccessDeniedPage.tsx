import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import React from "react";

interface AccessDeniedPageProps {
  reason?: "credentials" | "role";
}

export default function AccessDeniedPage({ reason = "credentials" }: AccessDeniedPageProps) {
  const isRole = reason === "role";

  return (
    <div className="flex w-full h-screen items-center justify-center">
      <div className="flex flex-col gap-4 p-4 items-center justify-center w-full max-w-sm h-96 bg-white rounded-xl">
        <div className="flex items-center justify-center h-20 w-20 bg-red-100 rounded-full">
          <TriangleAlert className="w-12 h-12 text-red-600" />
        </div>
        <span className="text-4xl text-center font-semibold text-[#0c0d0d]">
          Access Denied
        </span>
        <p className="text-center text-[#0c0d0d]">
          {isRole
            ? "You don't have permission to view this page."
            : "We couldn't verify your credentials. Please double-check your information and try again."}
        </p>
        <Link
          href={isRole ? "/dashboard" : "/"}
          className="text-center p-4 w-full bg-[#0c0d0d] text-white rounded-lg text-lg mt-4"
        >
          {isRole ? "Back to Dashboard" : "Return to Login"}
        </Link>
      </div>
    </div>
  );
}
