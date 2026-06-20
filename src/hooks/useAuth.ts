"use client";

import { useState, useEffect, useCallback } from "react";
import { getCurrentUser, logout as authLogout } from "../lib/auth";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setUser(null);
    window.location.href = "/";
  }, []);

  const refreshUser = useCallback(() => {
    const u = getCurrentUser();
    setUser(u);
  }, []);

  return {
    user,
    loading,
    logout,
    refreshUser,
    isAdmin: user?.role === "admin",
    isLecturer: user?.role === "lecturer",
    isStudent: user?.role === "student",
    isAuthenticated: !!user,
  };
}
