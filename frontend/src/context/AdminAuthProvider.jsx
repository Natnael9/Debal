import { createContext, useContext, useState, useEffect } from "react";

const ADMIN_TOKEN_KEY = "adminToken";
const AdminAuthContext = createContext(null);

function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}
function saveAdminToken(t) {
  if (t) localStorage.setItem(ADMIN_TOKEN_KEY, t);
  else   localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export const AdminAuthProvider = ({ children }) => {
  const [admin,     setAdmin]     = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Restore admin session on mount ─────────────────────────────────────────
  useEffect(() => {
    const stored = getAdminToken();
    if (stored) {
      // We don't have a /admin/me endpoint, but we can decode the stored state
      const raw = localStorage.getItem("adminUser");
      if (raw) {
        try { setAdmin(JSON.parse(raw)); } catch { /* ignore */ }
      }
    }
    setIsLoading(false);
  }, []);

  // ─── Admin login ─────────────────────────────────────────────────────────────
  const adminLogin = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Invalid admin credentials");
      }

      const data = await res.json();
      const token = data?.data?.token || data?.data?.accessToken;
      const adminUser = data?.data?.admin || data?.data?.user;

      if (!token) throw new Error("No token returned");

      saveAdminToken(token);
      localStorage.setItem("adminUser", JSON.stringify(adminUser || { email }));
      setAdmin(adminUser || { email, role: "admin" });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Admin logout ─────────────────────────────────────────────────────────────
  const adminLogout = () => {
    saveAdminToken(null);
    localStorage.removeItem("adminUser");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, adminLogin, adminLogout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
