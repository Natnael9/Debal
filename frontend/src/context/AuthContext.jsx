import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiPost, apiGet, setToken, clearToken, getToken } from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";
import { useNavigate } from "react-router-dom";

// ─── Password Requirements & Validation Utility ───────────────────────────────
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 72,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

export function validatePasswordStrength(password = "") {
  const pwd = password || "";
  const checks = {
    hasMinLength: pwd.length >= PASSWORD_REQUIREMENTS.minLength,
    hasMaxLength: pwd.length <= PASSWORD_REQUIREMENTS.maxLength,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
  };

  const errors = [];
  if (!checks.hasMinLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }
  if (!checks.hasMaxLength) {
    errors.push(`Password must be at most ${PASSWORD_REQUIREMENTS.maxLength} characters`);
  }
  if (!checks.hasUppercase) {
    errors.push("Must contain at least one uppercase letter (A-Z)");
  }
  if (!checks.hasLowercase) {
    errors.push("Must contain at least one lowercase letter (a-z)");
  }
  if (!checks.hasNumber) {
    errors.push("Must contain at least one number (0-9)");
  }
  if (!checks.hasSpecialChar) {
    errors.push("Must contain at least one special character (!@#$%^&*)");
  }

  let score = 0;
  if (checks.hasMinLength) score += 1;
  if (checks.hasUppercase && checks.hasLowercase) score += 1;
  if (checks.hasNumber) score += 1;
  if (checks.hasSpecialChar) score += 1;

  const labels = ["Too Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthLabel = pwd.length === 0 ? "" : labels[score] || "Weak";

  const isValid =
    checks.hasMinLength &&
    checks.hasMaxLength &&
    checks.hasUppercase &&
    checks.hasLowercase &&
    checks.hasNumber &&
    checks.hasSpecialChar;

  return {
    isValid,
    score, // 0 to 4
    strengthLabel,
    checks,
    errors,
  };
}

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
    // Front-end pre-validation check
    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
      return { success: false, error: strength.errors[0] || "Password does not meet strength requirements" };
    }

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
    PASSWORD_REQUIREMENTS,
    validatePasswordStrength,
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