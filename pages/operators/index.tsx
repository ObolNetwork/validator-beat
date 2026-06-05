"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";

export default function OperatorsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}
