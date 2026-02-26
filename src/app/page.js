// src/app/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/AuthContext";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [checkComplete, setCheckComplete] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Check if we have any authentication data
      const hasToken = !!localStorage.getItem("accessToken");
      
      if (isAuthenticated || hasToken) {
        // User is authenticated or has token, go to home
        router.push("/home");
      } else {
        // No authentication, go to login
        router.push("/login");
      }
      
      setCheckComplete(true);
    }
  }, [isAuthenticated, loading, router]);

  // Show loading until redirect happens
  if (!checkComplete) {
    return (
      <div className="flex h-screen items-center justify-center bg-almet-mystic dark:bg-gray-900">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-almet-sapphire mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return null;
}