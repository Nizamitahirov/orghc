// src/auth/AuthContext.jsx - COMPLETE VERSION
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { useRouter } from "next/navigation";
import { msalConfig, loginRequest, graphRequest } from "./authConfig";

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

  // ✅ Storage operations
  const setStorageItem = useCallback((key, value) => {
    try {
      localStorage.setItem(key, value);
      console.log(`✅ Stored ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Storage error for ${key}:`, error);
      return false;
    }
  }, []);

  const getStorageItem = useCallback((key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`❌ Read error for ${key}:`, error);
      return null;
    }
  }, []);

  const removeStorageItem = useCallback((key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`❌ Remove error for ${key}:`, error);
    }
  }, []);

  // ✅ Backend validation
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
        
        const data = await response.json();
        console.log("✅ Token valid, user data:", data);
        return data;
      } catch (error) {
        console.error(`❌ Validation attempt ${attempt + 1} failed:`, error.message);
        
        if (attempt === retries) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  // ✅ Clear authentication
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
      } catch (error) {
        console.error("❌ MSAL cache clear error:", error);
      }
    }
  }, [msalInstance, removeStorageItem]);

  // ✅ Refresh Graph token
  const refreshGraphToken = useCallback(async (accountToRefresh) => {
    if (!msalInstance || !accountToRefresh) {
      console.warn("⚠️ Cannot refresh Graph token - missing instance or account");
      return;
    }

    try {
      const expiry = getStorageItem("graphTokenExpiry");
      const now = new Date();

      if (!expiry || new Date(expiry) <= now) {
       

        const graphTokenResponse = await msalInstance.acquireTokenSilent({
          ...graphRequest,
          account: accountToRefresh,
        });

        setStorageItem("graphAccessToken", graphTokenResponse.accessToken);
        const newExpiry = new Date(Date.now() + 3600 * 1000).toISOString();
        setStorageItem("graphTokenExpiry", newExpiry);

     
      } 
    } catch (error) {
      console.error("❌ Failed to refresh Graph token:", error);
    }
  }, [msalInstance, getStorageItem, setStorageItem]);

  // Mövcud refreshBackendToken funksiyasını genişləndir
const refreshBackendToken = useCallback(async () => {
  const refreshToken = getStorageItem("refreshToken");
  if (!refreshToken) {
    await logout();
    return null;
  }

  try {
    // 1. Backend JWT refresh
    const response = await fetch(`${BACKEND_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`Refresh failed: ${response.status}`);

    const data = await response.json();
    if (data.access) {
      setStorageItem("accessToken", data.access);
    }

    // 2. Graph token-i də yenilə (eyni zamanda)
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
          
          // Backend-ə yeni graph token-i göndər (opsional amma tövsiyə olunur)
          await updateGraphTokenOnBackend(data.access, graphTokenResponse.accessToken);
          
        } catch (graphError) {
          console.warn("⚠️ Graph token silent refresh failed:", graphError);
          // Graph token refresh fail olsa belə, JWT refresh uğurludur
        }
      }
    }

    return data.access;
  } catch (error) {
    console.error("❌ Token refresh failed:", error);
    await logout();
    return null;
  }
}, [getStorageItem, setStorageItem, msalInstance]);

// Backend-ə yeni graph token göndər
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
  } catch (e) {
    console.warn("Graph token backend update failed:", e);
  }
};

  // ✅ Authenticate with backend
  const authenticateWithBackend = async (idToken, graphToken, msalAccount) => {
    try {
    
      console.log("📡 Backend URL:", BACKEND_URL);
      console.log("  - ID Token length:", idToken?.length || 0);

      if (!idToken) {
        throw new Error("No ID token available");
      }

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

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Backend error response:", errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.error || `Backend returned ${response.status}`);
      }

      const backendData = await response.json();
      console.log("📥 Backend response:", backendData);

      if (backendData.success) {
        const accessToken = backendData.access;
        const refreshToken = backendData.refresh;
        
        if (!accessToken || !refreshToken) {
          throw new Error("Backend didn't return tokens");
        }
        
      
        console.log("  - Access token length:", accessToken.length);
        console.log("  - Refresh token length:", refreshToken.length);
        
        // Store JWT tokens
        const accessStored = setStorageItem("accessToken", accessToken);
        const refreshStored = setStorageItem("refreshToken", refreshToken);
        
        if (!accessStored || !refreshStored) {
          throw new Error("Failed to store JWT tokens");
        }
        
        // Store Graph token
        if (graphToken) {
          setStorageItem("graphAccessToken", graphToken);
          const expiryTime = new Date(Date.now() + 3600 * 1000).toISOString();
          setStorageItem("graphTokenExpiry", expiryTime);
        }
        
        // Verify storage
        const verifyAccess = getStorageItem("accessToken");
        const verifyRefresh = getStorageItem("refreshToken");
        
        if (!verifyAccess || !verifyRefresh) {
          throw new Error("JWT token storage verification failed");
        }
        
       
        
        setAccount({
          ...msalAccount,
          ...backendData.user,
        });

        return true;
      }

      throw new Error(backendData.error || "Backend authentication failed");
      
    } catch (error) {
      console.error("❌ Backend authentication error:", error);
      
      if (error.name === 'AbortError') {
        console.error("  - Request timeout");
      } else if (error.message.includes('fetch')) {
        console.error("  - Network error - cannot reach backend");
        console.error(`  - Check if backend is running at: ${BACKEND_URL}`);
      }
      
      throw error;
    }
  };

  // ✅ MSAL initialization
  useEffect(() => {
    const initializeMsal = async () => {
      if (isProcessingAuth.current) return;
      isProcessingAuth.current = true;
      
      try {
       
        console.log("📡 Backend URL:", BACKEND_URL);
        
        const msalApp = new PublicClientApplication(msalConfig);
        await msalApp.initialize();
     

        // Handle redirect response
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
            console.error("❌ Redirect authentication error:", error);
            setAuthError(error.message);
            await clearAuth();
          }
        }

        // Check existing session
        setMsalInstance(msalApp);
        setInitialized(true);
        
        const accounts = msalApp.getAllAccounts();
        
        if (accounts.length > 0) {
       
          
          const token = getStorageItem("accessToken");
          
          if (token) {
   
            try {
              await validateTokenWithBackend(token);
              setAccount(accounts[0]);
             
            } catch (error) {
              console.warn("⚠️ Token validation failed");
              await clearAuth();
            }
          } else {
            console.log("⚠️ No stored token");
            await clearAuth();
          }
        }
        
      } catch (error) {
        console.error("❌ MSAL initialization error:", error);
        setAuthError("Authentication system failed to initialize");
      } finally {
        setLoading(false);
        isProcessingAuth.current = false;
      }
    };

    initializeMsal();
  }, []);

  // ✅ Graph token auto-refresh (every 10 minutes)
  useEffect(() => {
    if (!account || !msalInstance) return;

    const interval = setInterval(() => {

      refreshGraphToken(account);
    }, 10 * 60 * 1000);

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
      
      // 10 dəqiqədən az qalıbsa refresh et (1 dəqiqə deyil)
      if (timeUntilExpiry > 0 && timeUntilExpiry < 10 * 60 * 1000) {
        console.log(`⏰ Token expires in ${Math.floor(timeUntilExpiry/60000)} min, refreshing...`);
        await refreshBackendToken();
      } else if (timeUntilExpiry <= 0) {
        await logout();
      }
    } catch (error) {
      console.error("Token check error:", error);
    }
  };

  checkTokenExpiry();
  const intervalId = setInterval(checkTokenExpiry, 4 * 60 * 1000); // hər 4 dəqiqə
  return () => clearInterval(intervalId);
}, [account, initialized, refreshBackendToken, getStorageItem]);

  // ✅ Login function
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
          
        } catch (silentError) {
          console.log("⚠️ Silent login failed, redirecting to Microsoft...");
        }
      }

      
      await msalInstance.loginRedirect({
        ...loginRequest,
        redirectUri: window.location.origin,
        prompt: "select_account",
      });

    } catch (error) {
      console.error("❌ Login error:", error);
      setAuthError(error.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
      setLoading(false);
      isProcessingAuth.current = false;
    }
  }, [msalInstance, initialized, router, isLoggingIn]);

  // ✅ Logout function
  const logout = useCallback(async () => {
    if (!msalInstance || !initialized) return;

    try {
      
      // Backend logout
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
      } catch (logoutError) {
        console.warn("Backend logout failed:", logoutError);
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
      
      
    } catch (error) {
      console.error("❌ Logout error:", error);
      await clearAuth();
      router.push("/login");
    }
  }, [msalInstance, initialized, router, clearAuth, getStorageItem]);

  // ✅ Context value
  const contextValue = {
    account,
    isAuthenticated: !!account && !!getStorageItem("accessToken"),
    login,
    logout,
    loading,
    initialized,
    authError,
    isLoggingIn,
    clearError: () => setAuthError(null),
    refreshBackendToken,
  };

  // ✅ Expose to window for apiClient
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