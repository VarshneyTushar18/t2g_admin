"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy URL — redirect to module launcher */
export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return null;
}
