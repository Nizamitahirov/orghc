"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-almet-mystic dark:bg-gray-900">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-almet-sapphire"></div>
    </div>
  );
}
