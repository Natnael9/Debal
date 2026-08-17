import React, { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const adminLogin = async (email, password) => {
    setIsLoading(true);
    try {
      // TODO: Wire this to Robel's real POST /api/v1/admin/auth/login endpoint
      console.log("Mocking admin login for:", email);
      
      // Simulating a successful login and decoding the JWT claim
      setTimeout(() => {
        setAdmin({
          id: 'admin_123',
          email: email,
          role: 'moderator',
          type: 'admin' // The architecture requires this claim
        });
        setIsLoading(false);
      }, 800);
      
      return true;
    } catch (error) {
      console.error("Admin login failed", error);
      setIsLoading(false);
      return false;
    }
  };

  const adminLogout = () => {
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, adminLogin, adminLogout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);