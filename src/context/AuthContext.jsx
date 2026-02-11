import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("ironwork_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (user) => {
    setCurrentUser(user);
    localStorage.setItem("ironwork_current_user", JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("ironwork_current_user");
  };

  const value = useMemo(
    () => ({ currentUser, setCurrentUser, login, logout }),
    [currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
