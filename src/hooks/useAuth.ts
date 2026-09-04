import { useCallback, useEffect, useState } from "react";
import type { AuthUser } from "../types/user";
import * as authApi from "../lib/authApi";

const TOKEN_KEY = "postmortem.token";

type Status = "checking" | "authenticated" | "unauthenticated";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<Status>(() => (localStorage.getItem(TOKEN_KEY) ? "checking" : "unauthenticated"));

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    authApi
      .fetchMe(token)
      .then((fetchedUser) => {
        if (cancelled) return;
        setUser(fetchedUser);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setStatus("unauthenticated");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const signIn = useCallback(async (email: string, password: string) => {
    const newToken = await authApi.login(email, password);
    const fetchedUser = await authApi.fetchMe(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(fetchedUser);
    setStatus("authenticated");
  }, []);

  const signUp = useCallback(
    async (input: authApi.RegisterInput) => {
      await authApi.register(input);
      await signIn(input.email, input.password);
    },
    [signIn],
  );

  const signOut = useCallback(async () => {
    if (token) await authApi.logout(token);
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, [token]);

  return { status, user, signIn, signUp, signOut };
}
