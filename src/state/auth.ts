import { useSyncExternalStore } from "react";
import type { LoginResponse } from "@/types";

const AUTH_KEY = "ai-excel-agent-auth";

type AuthState = LoginResponse | null;
type Listener = () => void;

let authState: AuthState = readStoredAuth();
const listeners = new Set<Listener>();

function readStoredAuth(): AuthState {
  const raw = window.localStorage.getItem(AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    window.localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function setAuth(next: AuthState) {
  authState = next;
  if (next) {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(next));
  } else {
    window.localStorage.removeItem(AUTH_KEY);
  }
  emit();
}

export function getAuthToken() {
  return authState?.token;
}

export function useAuth() {
  const snapshot = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => authState
  );

  return {
    auth: snapshot,
    isAuthenticated: Boolean(snapshot?.token),
    logout: () => setAuth(null)
  };
}
