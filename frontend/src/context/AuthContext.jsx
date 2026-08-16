import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);

    try {
      // Temporary mock login
      console.log("Login:", credentials);

      const mockUser = {
        id: "1",
        name: "Test User",
        email: credentials.email,
      };

      setUser(mockUser);

      return {
        success: true,
        user: mockUser,
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);

    try {
      // Temporary mock registration
      console.log("Register:", userData);

      const mockUser = {
        id: "1",
        name: userData.name,
        email: userData.email,
      };

      setUser(mockUser);

      return {
        success: true,
        user: mockUser,
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
  return useContext(AuthContext);
}