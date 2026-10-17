import { createContext, useContext, useState } from "react";

const AuthContext = createContext();
const SESSION_KEYS = ["token", "userId", "userName", "userEmail", "userRole"];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    localStorage.getItem("token") && localStorage.getItem("userId")
      ? {
          userId: localStorage.getItem("userId"),
          name: localStorage.getItem("userName"),
          email: localStorage.getItem("userEmail"),
          expectedRole: localStorage.getItem("userRole"),
        }
      : null,
  );
  const signIn = (data) => {
    [data.token, data.userId, data.name, data.email, data.expectedRole].forEach(
      (value, i) => localStorage.setItem(SESSION_KEYS[i], value || ""),
    );
    setUser(data);
  };
  const signOut = () => {
    SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
    setUser(null);
  };
  const updateIdentity = (field, value) => {
    if (field === "name") localStorage.setItem("userName", value);
    if (field === "email") localStorage.setItem("userEmail", value);
    setUser((previous) => ({ ...previous, [field]: value }));
  };
  return (
    <AuthContext.Provider
      value={{ user, setUser, signIn, signOut, updateIdentity }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
