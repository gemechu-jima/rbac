// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({
  id: '123',
  name: 'Alex',
  role: 'moderator'
}); 
    
    const login = (userData) => setUser(userData);
    const logout = () => setUser(null);
    
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);