// src/auth/AuthContext.jsx - COMPLETE VERSION
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { useRouter } from "next/navigation";
import { msalConfig, loginRequest, loginRequestWithPrompt, graphRequest } from "./authConfig";

const AuthContext = createContext();

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function AuthProvider({ children }) {
  const [msalInstance, setMsalInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  
  const isProcessingAuth = useRef(false);

  //  Storage operations
  const setStorageItem = useCallback((key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }, []);

  const getStorageItem = useCallback((key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }, []);

  const removeStorageItem = useCallback((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // storage unavailable
    }
  }, []);

  //  Backend validation
  const validateTokenWithBackend = async (token, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${BACKEND_URL}/me/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  //  Clear authentication
  const clearAuth = useCallback(async () => {
    removeStorageItem("accessToken");
    removeStorageItem("refreshToken");
    removeStorageItem("graphAccessToken");
    removeStorageItem("graphTokenExpiry");
    setAccount(null);
    setAuthError(null);

    if (msalInstance) {
      try {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          await msalInstance.clearCache();
        }
      } catch {
        // cache clear failed, continue logout
      }
    }
  }, [msalInstance, removeStorageItem]);

  //  Refresh Graph token
  const refreshGraphToken = useCallback(async (accountToRefresh) => {
    if (!msalInstance || !accountToRefresh) return;

    try {
      const expiry = getStorageItem("graphTokenExpiry");
      const now = new Date();

      if (!expiry || new Date(expiry) <= now) {
        const graphTokenResponse = await msalInstance.acquireTokenSilent({
          ...graphRequest,
          account: accountToRefresh,
        });

        setStorageItem("graphAccessToken", graphTokenResponse.accessToken);
        setStorageItem("graphTokenExpiry", new Date(Date.now() + 3600 * 1000).toISOString());
      }
    } catch {
      // graph token refresh failed silently — will retry on next interval
    }
  }, [msalInstance, getStorageItem, setStorageItem]);

  const refreshBackendToken = useCallback(async () => {
  const refreshToken = getStorageItem("refreshToken");
  if (!refreshToken) {
    await logout();
    return null;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`Refresh failed: ${response.status}`);

    const data = await response.json();
    if (data.access) setStorageItem("accessToken", data.access);
    if (data.refresh) setStorageItem("refreshToken", data.refresh);

    if (msalInstance) {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        try {
          const graphTokenResponse = await msalInstance.acquireTokenSilent({
            ...graphRequest,
            account: accounts[0],
          });
          setStorageItem("graphAccessToken", graphTokenResponse.accessToken);
          setStorageItem("graphTokenExpiry", new Date(Date.now() + 3600 * 1000).toISOString());
          await updateGraphTokenOnBackend(data.access, graphTokenResponse.accessToken);
        } catch {
          // graph token refresh failed, JWT refresh still succeeded
        }
      }
    }

    return data.access;
  } catch {
    await logout();
    return null;
  }
}, [getStorageItem, setStorageItem, msalInstance]);

const updateGraphTokenOnBackend = async (accessToken, graphToken) => {
  try {
    await fetch(`${BACKEND_URL}/auth/update-graph-token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ graph_access_token: graphToken }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // non-critical, backend will use existing graph token
  }
};

  //  Authenticate with backend
  const authenticateWithBackend = async (idToken, graphToken, msalAccount) => {
    if (!idToken) throw new Error("No ID token available");

    const response = await fetch(`${BACKEND_URL}/auth/microsoft/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        id_token: idToken,
        graph_access_token: graphToken || null,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try { errorData = JSON.parse(errorText); } catch { errorData = { error: errorText }; }
      throw new Error(errorData.error || `Backend returned ${response.status}`);
    }

    const backendData = await response.json();

    if (backendData.success) {
      const { access: accessToken, refresh: refreshToken } = backendData;
      if (!accessToken || !refreshToken) throw new Error("Backend didn't return tokens");

      const accessStored = setStorageItem("accessToken", accessToken);
      const refreshStored = setStorageItem("refreshToken", refreshToken);
      if (!accessStored || !refreshStored) throw new Error("Failed to store JWT tokens");

      if (graphToken) {
        setStorageItem("graphAccessToken", graphToken);
        setStorageItem("graphTokenExpiry", new Date(Date.now() + 3600 * 1000).toISOString());
      }

      setAccount({ ...msalAccount, ...backendData.user });
      return true;
    }

    throw new Error(backendData.error || "Backend authentication failed");
  };

  //  MSAL initialization
  useEffect(() => {
    const initializeMsal = async () => {
      if (isProcessingAuth.current) return;
      isProcessingAuth.current = true;

      try {
        const msalApp = new PublicClientApplication(msalConfig);
        await msalApp.initialize();

        const redirectResponse = await msalApp.handleRedirectPromise();

        if (redirectResponse && redirectResponse.account) {
          try {
            const tokenResponse = await msalApp.acquireTokenSilent({
              ...loginRequest,
              account: redirectResponse.account,
            });

            const graphTokenResponse = await msalApp.acquireTokenSilent({
              ...graphRequest,
              account: redirectResponse.account,
            });

            await authenticateWithBackend(
              tokenResponse.idToken,
              graphTokenResponse.accessToken,
              redirectResponse.account
            );

            setMsalInstance(msalApp);
            setInitialized(true);
            setLoading(false);
            isProcessingAuth.current = false;
            router.push("/home");
            return;
          } catch (error) {
            setAuthError(error.message);
            await clearAuth();
          }
        }

        setMsalInstance(msalApp);
        setInitialized(true);

        const accounts = msalApp.getAllAccounts();

        if (accounts.length > 0) {
          const token = getStorageItem("accessToken");

          if (token) {
            try {
              await validateTokenWithBackend(token);
              setAccount(accounts[0]);
            } catch {
              try {
                const rt = getStorageItem("refreshToken");
                if (!rt) throw new Error("No refresh token");
                const res = await fetch(`${BACKEND_URL}/auth/refresh/`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refresh: rt }),
                  signal: AbortSignal.timeout(10000),
                });
                if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
                const d = await res.json();
                if (d.access) setStorageItem("accessToken", d.access);
                if (d.refresh) setStorageItem("refreshToken", d.refresh);
                if (d.access) setAccount(accounts[0]);
                else await clearAuth();
              } catch {
                await clearAuth();
              }
            }
          } else {
            await clearAuth();
          }
        }
      } catch {
        setAuthError("Authentication system failed to initialize");
      } finally {
        setLoading(false);
        isProcessingAuth.current = false;
      }
    };

    initializeMsal();
  }, []);

  //  Graph token auto-refresh (every 10 minutes)
  useEffect(() => {
    if (!account || !msalInstance) return;
    const interval = setInterval(() => refreshGraphToken(account), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [account, msalInstance, refreshGraphToken]);

  useEffect(() => {
    if (!account || !initialized) return;

    const checkTokenExpiry = async () => {
      const accessToken = getStorageItem("accessToken");
      if (!accessToken) return;

      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        const timeUntilExpiry = payload.exp * 1000 - Date.now();

        if (timeUntilExpiry > 0 && timeUntilExpiry < 10 * 60 * 1000) {
          await refreshBackendToken();
        } else if (timeUntilExpiry <= 0) {
          await logout();
        }
      } catch {
        // malformed token — will be caught on next API call
      }
    };

    checkTokenExpiry();
    const intervalId = setInterval(checkTokenExpiry, 4 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [account, initialized, refreshBackendToken, getStorageItem]);

  //  Login function
  const login = useCallback(async () => {
    if (isLoggingIn || isProcessingAuth.current) return;
    if (!msalInstance || !initialized) {
      setAuthError("System not ready");
      return;
    }

    try {
      setAuthError(null);
      setIsLoggingIn(true);
      setLoading(true);
      isProcessingAuth.current = true;

      const existingAccounts = msalInstance.getAllAccounts();

      if (existingAccounts.length > 0) {
        try {
          const tokenResponse = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: existingAccounts[0],
          });

          const graphTokenResponse = await msalInstance.acquireTokenSilent({
            ...graphRequest,
            account: existingAccounts[0],
          });

          await authenticateWithBackend(
            tokenResponse.idToken,
            graphTokenResponse.accessToken,
            existingAccounts[0]
          );

          router.push("/home");
          return;
        } catch {
          // silent login failed, fall through to redirect
        }
      }

      await msalInstance.loginRedirect({
        ...loginRequestWithPrompt,
        redirectUri: window.location.origin,
      });
    } catch (error) {
      setAuthError(error.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
      setLoading(false);
      isProcessingAuth.current = false;
    }
  }, [msalInstance, initialized, router, isLoggingIn]);

  //  Logout function
  const logout = useCallback(async () => {
    if (!msalInstance || !initialized) return;

    try {
      try {
        const token = getStorageItem("accessToken");
        if (token) {
          await fetch(`${BACKEND_URL}/auth/logout/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(3000),
          });
        }
      } catch {
        // backend logout failed, continue local logout
      }

      await clearAuth();

      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutRedirect({
          account: accounts[0],
          postLogoutRedirectUri: `${window.location.origin}/login`,
        });
      } else {
        router.push("/login");
      }
    } catch {
      await clearAuth();
      router.push("/login");
    }
  }, [msalInstance, initialized, router, clearAuth, getStorageItem]);

  const clearError = useCallback(() => setAuthError(null), []);

  const contextValue = useMemo(() => ({
    account,
    isAuthenticated: !!account && !!getStorageItem("accessToken"),
    login,
    logout,
    loading,
    initialized,
    authError,
    isLoggingIn,
    clearError,
    refreshBackendToken,
  }), [account, login, logout, loading, initialized, authError, isLoggingIn, clearError, refreshBackendToken, getStorageItem]);

  //  Expose to window for apiClient
  useEffect(() => {
    if (refreshBackendToken) {
      window.__refreshBackendToken = refreshBackendToken;
    }
    
    return () => {
      delete window.__refreshBackendToken;
    };
  }, [refreshBackendToken]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth() must be used within AuthProvider');
  }
  return context;
}