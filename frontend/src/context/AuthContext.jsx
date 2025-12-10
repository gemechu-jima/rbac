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
  const [loading, setLoading]=useState(true);
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
    const restore = () => {
    try {
      const stored = localStorage.getItem("userData");
      if (!stored) {
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(stored);
      const expirationDate = new Date(parsed.expiration);

      if (expirationDate <= new Date()) {
        localStorage.removeItem("userData");
        setLoading(false);
        return;
      }

      // use ONE state update batch
      setUser(parsed.user);
      setToken(parsed.token);
      setTokenExpiredTime(expirationDate);
    } catch (err) {
      localStorage.removeItem("userData");
      console.error("Failed to restore auth state:", err);
    }

    setLoading(false);
  };

  restore();
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
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
