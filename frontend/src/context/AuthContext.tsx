import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: "free" | "premium" | "business";
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Auto-authenticated user for development
  const defaultUser: User = {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    plan: "free",
  };

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session in localStorage
    const checkAuth = () => {
      const savedUser = localStorage.getItem("buffer_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for storage events to sync auth state across tabs
    window.addEventListener("storage", (e) => {
      if (e.key === "buffer_user") {
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
      // Development credentials
      const validEmail = "test@example.com";
      const validPassword = "test";

      if (email === validEmail && password === validPassword) {
        const mockUser: User = {
          id: "1",
          name: "Test User",
          email: validEmail,
          plan: "premium",
        };

        setUser(mockUser);
        localStorage.setItem("buffer_user", JSON.stringify(mockUser));
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Mock signup - in a real app, this would be an API call
      const mockUser: User = {
        id: Date.now().toString(),
        name,
        email,
        plan: "free",
      };

      setUser(mockUser);
      localStorage.setItem("buffer_user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("buffer_user");
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
