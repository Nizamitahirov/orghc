"use client";

import { createContext, useContext, useMemo } from "react";

const AuthContext = createContext();

const mockUser = {
  name: "Demo User",
  username: "demo@company.com",
  email: "demo@company.com",
};

export function AuthProvider({ children }) {
  const contextValue = useMemo(() => ({
    account: mockUser,
    isAuthenticated: true,
    login: async () => {},
    logout: async () => {},
    loading: false,
    initialized: true,
    authError: null,
    isLoggingIn: false,
    clearError: () => {},
    refreshBackendToken: async () => null,
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
    throw new Error("useAuth() must be used within AuthProvider");
  }
  return context;
}
