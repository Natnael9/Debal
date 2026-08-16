import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = user !== null;

  const login = async (credentials) => {
    setLoading(true);

    try {
      // Backend authentication will be connected here later.

      console.log("Login:", credentials);

      // Temporary mock user
      const mockUser = {
        id: 1,
        name: "Test User",
        email: credentials.email,
      };

      setUser(mockUser);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);

    try {
      // Backend registration will be connected here later.

      console.log("Register:", userData);

      // Temporary mock user
      const mockUser = {
        id: 1,
        name: userData.name,
        email: userData.email,
      };

      setUser(mockUser);
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
    isAuthenticated,
    login,
    register,
    logout,
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