// src/components/auth/ProtectedRoute.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, account, login } = useAuth();
  const router = useRouter();
  const [attemptedSilentLogin, setAttemptedSilentLogin] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Check if we have tokens but no account (session inconsistency)
      const hasToken = !!localStorage.getItem("accessToken");
      
      if (!isAuthenticated && hasToken && !attemptedSilentLogin) {
   
        setAttemptedSilentLogin(true);
        
        // Give it a moment for AuthContext to initialize
        setTimeout(() => {
          if (!isAuthenticated) {
            console.log("❌ Silent login failed, redirecting to login");
            router.push("/login");
          }
        }, 2000);
      } else if (!isAuthenticated && !hasToken) {
        // No token, redirect to login
        router.push("/login");
      }
    }
  }, [isAuthenticated, loading, router, attemptedSilentLogin]);

  // Show loading while checking authentication
  if (loading || (!isAuthenticated && attemptedSilentLogin)) {
    return (
      <div className="flex h-screen items-center justify-center bg-almet-mystic dark:bg-gray-900">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-almet-sapphire mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {attemptedSilentLogin ? "Restoring session..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Show the protected content if authenticated
  return isAuthenticated ? children : null;
}