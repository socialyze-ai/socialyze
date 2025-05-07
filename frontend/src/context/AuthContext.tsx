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
  const loginMutation = useLogin();
  const signupMutation = useSignup();

  useEffect(() => {
    // Check for existing user session in localStorage
    const checkAuth = () => {
      const savedUser = localStorage.getItem("socialyze_user");
      const token = localStorage.getItem("socialyze_token");

      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for storage events to sync auth state across tabs
    window.addEventListener("storage", (e) => {
      if (e.key === "socialyze_user") {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
        } else {
          setUser(null);
        }
      }
    });
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await loginMutation.mutateAsync({ email, password } as any);

      if (response.error) {
        throw new Error(response.error);
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
    try {
      const response = await signupMutation.mutateAsync({
        name,
        email,
        password,
        confirmPassword,
      } as any);

      if (response.error) {
        throw new Error(response.error);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
