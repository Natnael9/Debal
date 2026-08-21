import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Temporary login
  const login = async (credentials) => {
    setLoading(true);

    try {
      console.log("Login:", credentials);

      const mockUser = {
        id: "1",
        name: "Test User",
        email: credentials.email,
        questionnaireCompleted: true,
      };

      setUser(mockUser);

      return {
        success: true,
        user: mockUser,
      };
    } catch (error) {
      console.error("Login error:", error);

      return {
        success: false,
        error: error.message,
      };
    } finally {
      setLoading(false);
    }
  };

  // Temporary registration
  const register = async (userData) => {
    setLoading(true);

    try {
      console.log("Register:", userData);

      const mockUser = {
        id: "1",
        name: userData.name,
        email: userData.email,
        questionnaireCompleted: false,
      };

      setUser(mockUser);

      return {
        success: true,
        user: mockUser,
      };
    } catch (error) {
      console.error("Register error:", error);

      return {
        success: false,
        error: error.message,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
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

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}