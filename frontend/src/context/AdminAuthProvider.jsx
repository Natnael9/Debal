import React, { createContext, useContext, useState } from "react";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const adminLogin = async (email, password) => {
    setIsLoading(true);

    try {
      // Temporary mock login
      await new Promise((resolve) => setTimeout(resolve, 800));

      setAdmin({
        id: "admin_123",
        name: "Natnael Ashenafi",
        email: email,
        role: "moderator",
        type: "admin",
      });

      setIsLoading(false);

      return true;
    } catch (error) {
      console.error("Admin login failed:", error);

      setIsLoading(false);

      return false;
    }
  };

  const adminLogout = () => {
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        adminLogin,
        adminLogout,
        isLoading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  return useContext(AdminAuthContext);
};