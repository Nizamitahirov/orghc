// src/auth/AuthContext.jsx - Mock auth context (always authenticated for demo)
"use client";

import { createContext, useContext, useMemo } from "react";

const AuthContext = createContext();

const MOCK_ACCOUNT = {
  name: "Demo User",
  username: "demo@company.az",
  localAccountId: "mock-id-001",
};

export function AuthProvider({ children }) {
  const contextValue = useMemo(() => ({
    account: MOCK_ACCOUNT,
    isAuthenticated: true,
    login: async () => {},
    logout: async () => {},
    loading: false,
    initialized: true,
    authError: null,
    isLoggingIn: false,
    clearError: () => {},
    refreshBackendToken: async () => {},
  }), []);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default AuthContext;
