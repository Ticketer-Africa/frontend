"use client";

import { Logo } from "@/components/layout/logo";
import { buildEndpoint } from "@/services/api-config";
import Axios from "@/services/axios";
import { useRouter, usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

interface User {
  sub: string;
  email: string;
  name: string;
  role: "USER" | "ORGANIZER" | "ADMIN" | "SUPERADMIN";
  profileImage?: string;
  isVerified: boolean;
}

interface UserContextType {
  user: User | null;
  logout: () => Promise<void>;
}

interface AuthStatusContextType {
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
const AuthStatusContext = createContext<AuthStatusContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/",
    "/explore",
    "/events",
    "/terms",
    "/service-agreement",
    "/reset-password",
    "/verify-otp",
    "/checkout",
    "/my-tickets",
    "/resale",
  ];

  const API_VERSION = "v1";

  const fetchUser = useCallback(async () => {
    try {
      const response = await Axios.get(buildEndpoint(API_VERSION, "auth/me"));
      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem("ticketer-user", JSON.stringify(userData));
    } catch (error: any) {
      setUser(null);
      localStorage.removeItem("ticketer-user");

      // Only redirect to login if:
      // 1. We're NOT on a public route
      // 2. AND the error is 401/403 (unauthorized)
      const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
      );

      const isUnauthenticated =
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        error.message?.includes("401");

      if (!isPublicRoute && isUnauthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    // Don't fetch user if we're on a public route AND there's no stored user hint
    const isPublicRoute = publicRoutes.some((route) =>
      pathname.startsWith(route)
    );

    const storedUser = localStorage.getItem("ticketer-user");

    // If we're on a public route AND no stored user → skip fetch entirely
    if (isPublicRoute && !storedUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Add pathname as dependency

  const logout = useCallback(async () => {
    try {
      await Axios.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("ticketer-user");
      router.push("/login");
    }
  }, [router]);

  const userValue = useMemo<UserContextType>(
    () => ({ user, logout }),
    [user, logout],
  );

  const statusValue = useMemo<AuthStatusContextType>(
    () => ({ isLoading }),
    [isLoading],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Logo
              size="lg"
              withText={true}
              text="Ticketer Africa"
              imgSrc="/logo.png"
              className="animate-pulse-glow"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={userValue}>
      <AuthStatusContext.Provider value={statusValue}>
        {children}
      </AuthStatusContext.Provider>
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  return context;
}

export function useAuthStatus() {
  const context = useContext(AuthStatusContext);
  if (context === undefined) {
    throw new Error("useAuthStatus must be used within an AuthProvider");
  }
  return context;
}
