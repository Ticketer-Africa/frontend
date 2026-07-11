"use client";

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
  useRef,
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
  const fetchAttemptedRef = useRef(false);

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
    // Re-evaluates per navigation (cheap — no network call), but the network
    // fetch itself only ever fires once per session via fetchAttemptedRef.
    // middleware.ts is the actual route-protection boundary; this client-side
    // fetch only needs to happen once, to hydrate `user` for display. We can't
    // gate on mount alone: if the app first mounts on a public route with no
    // stored user hint, we skip the fetch — but if the visitor then navigates
    // into a protected route with a valid session cookie the middleware let
    // them through on, we still need to hydrate `user` at that point, or the
    // UI stays stuck showing them as logged out until a hard reload.
    if (fetchAttemptedRef.current) return;

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

    fetchAttemptedRef.current = true;
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
