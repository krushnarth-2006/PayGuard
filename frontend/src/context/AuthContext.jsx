import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("payguard_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("payguard_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("payguard_user");
    }
  }, [user]);

  function login(userData) {
    setUser(userData);
    return {
      success: true,
      user: userData,
    };
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}