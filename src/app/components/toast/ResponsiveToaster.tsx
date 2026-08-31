"use client";

import { Toaster } from "sonner";
import { useEffect, useState } from "react";

export function ResponsiveToaster() {
  const [position, setPosition] = useState<
    "top-center" | "bottom-right"
  >("top-center");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const updatePosition = () => {
      setPosition(mediaQuery.matches ? "bottom-right" : "top-center");
    };

    updatePosition();

    mediaQuery.addEventListener("change", updatePosition);

    return () => { 
      mediaQuery.removeEventListener("change", updatePosition);
    };
  }, []);

  return <Toaster position={position} richColors closeButton />;
}