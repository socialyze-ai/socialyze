import React, { createContext, useContext, useState, useEffect } from "react";
import { useLogin, useSignup, User as ApiUser } from "@/api/apiHooks/useAuth";

type User = ApiUser;

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State to store error messages
  const loginMutation = useLogin();
  const signupMutation = useSignup();

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem("socialyze_user");
      const token = localStorage.getItem("socialyze_token");

      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      } else if (token) {
        // This approach handles cases where only the token is stored
        setUser({
          _id: "token-user",
          name: "User",
          email: "",
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setLoading(false);
    };

    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "socialyze_user") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      const response = await loginMutation.mutateAsync({ email, password });

      if (response.error) {
        setError(response.error); // Store error message
        throw new Error(response.error);
      }

      if (!response.data) {
        const errorMsg = "Login failed: No data received";
        setError(errorMsg); // Store error message
        throw new Error(errorMsg);
      }

      const { user, token } = response.data;

      setUser(user);
      localStorage.setItem("socialyze_user", JSON.stringify(user));
      localStorage.setItem("socialyze_token", token);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, confirmPassword: string) => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      const response = await signupMutation.mutateAsync({
        name,
        email,
        password,
        confirmPassword,
      });

      if (response.error) {
        setError(response.error); // Store error message
        throw new Error(response.error);
      }

      if (!response.data) {
        const errorMsg = "Signup failed: No data received";
        setError(errorMsg); // Store error message
        throw new Error(errorMsg);
      }

      const { user, token } = response.data;

      setUser(user);
      localStorage.setItem("socialyze_user", JSON.stringify(user));
      localStorage.setItem("socialyze_token", token);
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("socialyze_user");
    localStorage.removeItem("socialyze_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
