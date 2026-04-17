import { useEffect, useState } from "react";

const USER_KEY = "ars_user";
const TOKEN_KEY = "ars_token";
const AUTH_EVENT = "ars-auth-changed";

function parseStoredUser(value) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    localStorage.removeItem(USER_KEY);
  }

  return null;
}

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => parseStoredUser(localStorage.getItem(USER_KEY)));

  const syncAuth = () => {
    setToken(localStorage.getItem(TOKEN_KEY));
    setUser(parseStoredUser(localStorage.getItem(USER_KEY)));
  };

  const persistAuth = (payload) => {
    if (!payload?.access_token || !payload?.user || typeof payload.user !== "object") {
      throw new Error("Invalid authentication response.");
    }

    localStorage.setItem(TOKEN_KEY, payload.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    syncAuth();
    window.dispatchEvent(new Event(AUTH_EVENT));
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    syncAuth();
    window.dispatchEvent(new Event(AUTH_EVENT));
  };

  useEffect(() => {
    const handleStorage = () => syncAuth();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_EVENT, handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_EVENT, handleStorage);
    };
  }, []);

  return { token, user, persistAuth, logout };
}
