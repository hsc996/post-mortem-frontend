import { useCallback, useEffect, useState } from "react";
import type { AuthUser } from "../types/user";
import * as authApi from "../lib/authApi";
import { registerUnauthorizedHandler } from "../lib/apiClient";

const TOKEN_KEY = "postmortem.token";

type Status = "checking" | "authenticated" | "unauthenticated";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<Status>(() => (localStorage.getItem(TOKEN_KEY) ? "checking" : "unauthenticated"));
  const [sessionExpired, setSessionExpired] = useState(false);

  // Any 401 anywhere in the app — not just the initial session check —
  // routes here, so a token that expires or gets revoked mid-session
  // bounces back to the login screen instead of surfacing as a stuck
  // "blocked" panel action or a generic feed load error.
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setSessionExpired(true);
      setStatus("unauthenticated");
    });
    return () => registerUnauthorizedHandler(null);
  }, []);

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

  /** Shared by a normal login and the invite-accept flow, which already has a fresh access token in hand. */
  const signInWithToken = useCallback(async (newToken: string) => {
    const fetchedUser = await authApi.fetchMe(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(fetchedUser);
    setSessionExpired(false);
    setStatus("authenticated");
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const newToken = await authApi.login(email, password);
      await signInWithToken(newToken);
    },
    [signInWithToken],
  );

  const signUp = useCallback(
    async (input: authApi.RegisterInput) => {
      const newToken = await authApi.register(input);
      await signInWithToken(newToken);
    },
    [signInWithToken],
  );

  const signOut = useCallback(async () => {
    if (token) await authApi.logout(token);
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setSessionExpired(false);
    setStatus("unauthenticated");
  }, [token]);

  return { status, user, token, sessionExpired, signIn, signUp, signInWithToken, signOut };
}
