// src/context/AuthContext.jsx
import { useNavigate } from "react-router-dom";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [token, setToken] = useState();
  const [tokenExpiredTime, setTokenExpiredTime] = useState();
  const logoutTimerRef = useRef(null);
  const navigate = useNavigate();

  const login = useCallback((result) => {
    const user = result.user;
    const token = result.token;
    const expirationDate = new Date(Date.now() + 60 * 60 * 1000);
    setUser(user);
    setToken(token);
    setTokenExpiredTime(expirationDate);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        user,
        token,
        expiration: expirationDate.toISOString(),
      })
    );
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("userData");
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    navigate("/");
  }, [navigate]);
useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) return;

    try {
      const parsed = JSON.parse(userData);
      const { user, token, expiration } = parsed;

      const expirationDate = new Date(expiration);

      if (expirationDate > new Date()) {
        Promise.resolve().then(() => {
          setUser(user);
          setToken(token);
          setTokenExpiredTime(expirationDate);
        });
      } else {
        localStorage.removeItem("userData");
      }
    } catch {
      localStorage.removeItem("userData");
    }
  }, []);

  useEffect(() => {
    if (token && tokenExpiredTime) {
      const remainTime = tokenExpiredTime.getTime() - Date.now();
      if (remainTime > 0) {
        logoutTimerRef.current = setTimeout(logout, remainTime);
      } else {
        Promise.resolve().then(() => logout());
      }
    }
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
  }, [token, tokenExpiredTime, logout]);
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
