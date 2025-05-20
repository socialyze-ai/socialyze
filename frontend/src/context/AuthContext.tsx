import React, { createContext, useContext, useState, useEffect } from "react";
import { useLogin, useSignup, User as ApiUser } from "@/api/apiHooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { logout as reduxLogout } from "@/redux/slices/auth.slice";

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
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem("socialyze_user");
      const token = localStorage.getItem("socialyze_token");

      if (savedUser && token) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (err) {
          console.error("Failed to parse saved user from localStorage:", err);
          localStorage.removeItem("socialyze_user");
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "socialyze_user" || e.key === "socialyze_token") {
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

    queryClient.clear();
    dispatch(reduxLogout());
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
