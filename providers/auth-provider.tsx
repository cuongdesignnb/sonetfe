"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  cccd?: string;
  date_of_birth?: string;
  is_active?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    options?: { redirectTo?: string | null },
  ) => Promise<void>;
  register: (
    data: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      phone?: string;
      cccd?: string;
      referralCode?: string;
    },
    options?: { redirectTo?: string | null },
  ) => Promise<void>;
  updateProfile: (
    payload: Partial<User> & { password?: string },
  ) => Promise<User>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// Configure axios defaults - use production API URL
axios.defaults.baseURL =
  process.env.NEXT_PUBLIC_API_URL || "https://admin.phamanhchien.vn/api";

// Add token to requests if available
axios.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get("/auth/me");
      setUser(response.data.user);
    } catch {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    options?: { redirectTo?: string | null },
  ) => {
    try {
      const response = await axios.post("/auth/login", { email, password });
      const { user, token } = response.data;

      localStorage.setItem("token", token);
      setUser(user);
      toast.success("Đăng nhập thành công!");

      // Redirect: explicit param > saved redirect > dashboard
      const savedRedirect = localStorage.getItem("auth_redirect");
      localStorage.removeItem("auth_redirect");
      const target =
        options?.redirectTo !== undefined
          ? options.redirectTo
          : savedRedirect || "/dashboard";
      if (target) router.push(target);
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Đăng nhập thất bại");
      toast.error(message);
      throw new Error(message);
    }
  };

  const register = async (
    data: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      phone?: string;
      cccd?: string;
      referralCode?: string;
    },
    options?: { redirectTo?: string | null },
  ) => {
    try {
      const response = await axios.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword,
        phone: data.phone || undefined,
        cccd: data.cccd || undefined,
        referral_code: data.referralCode || undefined,
      });
      const { user, token } = response.data;

      localStorage.setItem("token", token);
      setUser(user);
      toast.success("Đăng ký thành công!");

      // Redirect: explicit param > saved redirect > dashboard
      const savedRedirect = localStorage.getItem("auth_redirect");
      localStorage.removeItem("auth_redirect");
      const target =
        options?.redirectTo !== undefined
          ? options.redirectTo
          : savedRedirect || "/dashboard";
      if (target) router.push(target);
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Đăng ký thất bại");
      toast.error(message);
      throw new Error(message);
    }
  };

  const updateProfile = async (
    payload: Partial<User> & { password?: string },
  ) => {
    const response = await axios.put("/auth/me", payload);
    const updated = response.data.user as User;
    setUser(updated);
    toast.success("Cập nhật hồ sơ thành công!");
    return updated;
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      toast.success("Đăng xuất thành công");
      router.push("/");
    }
  };

  const value = {
    user,
    login,
    register,
    updateProfile,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as {
    response?: {
      data?: { message?: string; errors?: Record<string, string[]> };
    };
  };
  const data = axiosError.response?.data;
  const message = data?.message;
  const errors = data?.errors;
  if (errors) {
    const firstKey = Object.keys(errors)[0];
    const firstError = firstKey ? errors[firstKey]?.[0] : undefined;
    return firstError || message || fallback;
  }
  return message || fallback;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
