const AUTH_SESSION_KEY = "authorized_session";

export const saveAuthorizedSession = (session) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};

export const getAuthorizedSession = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

export const clearAuthorizedSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_SESSION_KEY);
};
