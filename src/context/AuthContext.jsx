// import { createContext, useContext, useState, useCallback, useEffect } from "react";
// import { setToken, clearToken } from "../utils/api";

// const AuthContext = createContext(null);

// function parseJwt(token) {
//   try {
//     return JSON.parse(atob(token.split(".")[1]));
//   } catch {
//     return null;
//   }
// }

// export function AuthProvider({ children }) {
//   // ✅ Rehydrate token from sessionStorage on mount
//   const [accessToken, setAccessToken] = useState(() => {
//     return sessionStorage.getItem("access_token") || null;
//   });

//   const [user, setUser] = useState(() => {
//     const t = sessionStorage.getItem("access_token");
//     return t ? parseJwt(t) : null;
//   });

//   // ✅ Keep axios in sync whenever token changes
//   useEffect(() => {
//     if (accessToken) {
//       setToken(accessToken);
//     } else {
//       clearToken();
//     }
//   }, [accessToken]);

//   const login = useCallback((token) => {
//     console.log("login() called with token:", token); // remove after testing
//     sessionStorage.setItem("access_token", token);   // ✅ persist
//     setAccessToken(token);
//     setUser(parseJwt(token));
//   }, []);

//   const logout = useCallback(async () => {
//     try {
//       await import("../utils/api").then(m => m.default.post("/auth/logout"));
//     } catch {}
//     sessionStorage.removeItem("access_token");        // ✅ clear
//     setAccessToken(null);
//     setUser(null);
//   }, []);

//   return (
//     <AuthContext.Provider value={{ accessToken, user, login, logout, isAuthenticated: !!accessToken }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { setToken, clearToken } from "../utils/api";

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser]               = useState(null);
  const [isLoading, setIsLoading]     = useState(true); // ← IMPORTANT

  // ✅ On every app load, try to restore session via refresh token cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
       const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/users/refresh`,
          {
            method: "POST",
            credentials: "include", // ← sends httpOnly cookie automatically
          }
        );

        if (!response.ok) throw new Error(`${response.status}`);
        const data = await response.json();
        setToken(data.access_token);
        setAccessToken(data.access_token);
        setUser(parseJwt(data.access_token));
      } catch {
        // Refresh token expired or doesn't exist → user needs to login
        clearToken();
        setAccessToken(null);
        setUser(null);
      } finally {
        console.log("Loading...", isLoading)
        setIsLoading(false); // ← done checking, render the app
      }
    };

    restoreSession();
  }, []);

  const login = useCallback((token) => {
    setToken(token);
    setAccessToken(token);
    setUser(parseJwt(token));
  }, []);

  const logout = useCallback(async () => {
    try {
      const { default: api } = await import("../utils/api");
      await api.post("/auth/logout");
    } catch {
      console.log('error=')
    }
    clearToken();
    setAccessToken(null);
    setUser(null);
  }, []);

  // ✅ Don't render anything until we know the auth state
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout, isAuthenticated: !!accessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);