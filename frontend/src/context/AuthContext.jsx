import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Anonymous student token — stored in localStorage
  const [token, setToken] = useState(localStorage.getItem('cv-anon-token'));

  // Admin: stores the raw ADMIN_SECRET_KEY (sent as Bearer header)
  const [adminKey, setAdminKeyState] = useState(localStorage.getItem('cv-admin-key'));

  const isAdmin = !!adminKey;

  /**
   * Student login — called after successful magic link verification.
   * IMPORTANT: Also clears any active admin session, so the admin panel
   * does not bleed into the student's view after you've been testing as admin.
   */
  const login = (anonymousToken) => {
    localStorage.setItem('cv-anon-token', anonymousToken);
    // Clear admin key to prevent the admin UI from showing for students
    localStorage.removeItem('cv-admin-key');
    setToken(anonymousToken);
    setAdminKeyState(null);
  };

  const logout = () => {
    localStorage.removeItem('cv-anon-token');
    setToken(null);
  };

  const setAdmin = (key) => {
    localStorage.setItem('cv-admin-key', key);
    setAdminKeyState(key);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('cv-admin-key');
    setAdminKeyState(null);
  };

  /** Returns the Authorization header for all admin API calls */
  const getAdminHeaders = () => ({
    Authorization: `Bearer ${adminKey}`,
  });

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAdmin,
        adminKey,
        setAdmin,
        logoutAdmin,
        getAdminHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
