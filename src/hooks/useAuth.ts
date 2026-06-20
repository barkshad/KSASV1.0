import { useState, useEffect } from 'react';
import { seedAdminIfNotExists } from '../lib/seed-admin';

let seeded = false;

// We can cache the parsed user to prevent infinite render loops in case of reference changes
const getCachedUser = () => {
    const cachedUser = localStorage.getItem('ksas_current_user');
    if (cachedUser) {
        try { return JSON.parse(cachedUser); } catch(e) { return null; }
    }
    return null;
}

export function useAuth() {
  const [user, setUser] = useState<any>(getCachedUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Seed admin once globally in background
    if (!seeded) {
        seeded = true;
        seedAdminIfNotExists().catch(e => {
            console.error("Failed to seed admin", e);
        });
    }
  }, []);

  const login = (userData: any) => {
    localStorage.setItem('ksas_current_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('ksas_current_user');
    setUser(null);
    window.location.href = '/';
  };

  return { user, loading, login, logout };
}

