"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  getCurrentSession,
  logoutAdmin,
} from "@/lib/auth-api";

import type {
  AdminUser,
} from "@/lib/auth-api";

type UseAdminSessionResult = {
  user: AdminUser | null;
  isCheckingSession: boolean;
  logout: () => Promise<void>;
};

export function useAdminSession():
UseAdminSessionResult {
  const router = useRouter();

  const [user, setUser] =
    useState<AdminUser | null>(null);

  const [
    isCheckingSession,
    setIsCheckingSession,
  ] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const session =
          await getCurrentSession();

        if (!session) {
          router.replace("/");
          return;
        }

        setUser(session.user);
      } catch {
        router.replace("/");
      } finally {
        setIsCheckingSession(false);
      }
    }

    void checkSession();
  }, [router]);

  async function logout(): Promise<void> {
    try {
      await logoutAdmin();
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  return {
    user,
    isCheckingSession,
    logout,
  };
}