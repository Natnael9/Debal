import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiPost, apiGet, setToken, clearToken, getToken } from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true until we try to restore session

  // ─── Session restore on mount ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getToken();
      if (!token) { setLoading(false); return; }

      try {
        const data = await apiGet("/users/me");
        if (!cancelled) {
          const u = data?.data?.user;
          setUser(u);
          if (u) connectSocket(token);
        }
      } catch {
        // Token is stale / refresh also failed inside apiGet – clear it
        clearToken();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  // ─── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    try {
      await apiPost("/auth/register", { name, email, password });
      // Auto-login after successful registration
      return await _doLogin(email, password);
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password, rememberMe }) => {
    setLoading(true);
    try {
      return await _doLogin(email, password, rememberMe);
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  async function _doLogin(email, password, rememberMe = false) {
    const data = await apiPost("/auth/login", { email, password, rememberMe });
    const token = data?.data?.accessToken;
    const u     = data?.data?.user;

    if (!token || !u) throw new Error("Unexpected response from server");

    setToken(token);
    setUser(u);
    connectSocket(token);

    return { success: true, user: u };
  }

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout");
    } catch { /* best-effort */ }
    clearToken();
    disconnectSocket();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}