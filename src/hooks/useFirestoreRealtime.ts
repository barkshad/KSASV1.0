"use client";

import { useEffect, useState, useCallback } from "react";
import {
  subscribeToAttendance,
  subscribeToSession,
  subscribeToActiveSessions,
} from "../lib/db";

export function useLiveAttendance(sessionId: string | null) {
  const [records, setRecords] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToAttendance(sessionId, (data) => {
      setRecords(data);
      setCount(data.length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId]);

  return { records, count, loading };
}

export function useLiveSession(sessionId: string | null) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToSession(sessionId, (data) => {
      setSession(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId]);

  return { session, loading };
}

export function useActiveSessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToActiveSessions((data) => {
      setSessions(data);
      setCount(data.length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { sessions, count, loading };
}
