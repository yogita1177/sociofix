import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { loginUser, registerUser, getCurrentUser } from "../api/auth";

const AuthContext = createContext(undefined);

const TOKEN_KEY = "sociofix_token";
const USER_KEY = "sociofix_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateFromCache = () => {
    try {
      const cached = localStorage.getItem(USER_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setIsLoading(false);
      return;
    }

    setUser(hydrateFromCache());

    getCurrentUser()
      .then((res) => {
        // Backend: { success, message, data: user }
        const currentUser = res.data.data;

        setUser(currentUser);
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await loginUser(credentials);

    // Backend:
    // {
    //   success: true,
    //   message: "...",
    //   data: {
    //      access_token: "...",
    //      token_type: "bearer"
    //   }
    // }

    const token =
      res.data?.data?.access_token ||
      res.data?.access_token ||
      res.data?.token;

    if (!token) {
      throw new Error("No access token received from server");
    }

    localStorage.setItem(TOKEN_KEY, token);

    // Fetch logged-in user
    const meRes = await getCurrentUser();
    const currentUser = meRes.data.data;

    localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    setUser(currentUser);

    return currentUser;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await registerUser(payload);
    return res.data.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    toast.success("Logged out successfully");
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
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
  const ctx = useContext(AuthContext);

  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}