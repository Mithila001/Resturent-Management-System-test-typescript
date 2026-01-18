/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

export interface User {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string, role?: string) => Promise<AuthResult>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  // Configure axios base URL
  const envApiUrl = import.meta.env.VITE_API_URL;
  console.log("DEBUG: AuthContext VITE_API_URL:", envApiUrl);

  const api = axios.create({
    baseURL: envApiUrl || "http://localhost:5000/api",
  });

  // Attach token to requests if it exists
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      if (token) {
        try {
          // Verify token and get profile
          const { data } = await api.get("/auth/profile");
          setUser(data as User);
        } catch (error) {
          console.error("Info: Token invalid or expired");
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, [token]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data as User);
      return { success: true, role: data.role };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role = "customer",
  ): Promise<AuthResult> => {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data as User);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
