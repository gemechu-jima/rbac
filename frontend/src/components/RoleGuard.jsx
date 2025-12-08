// src/components/RoleGuard.jsx
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// Define role hierarchy (higher = more access)
const ROLE_LEVEL = {
  guest: 0,
  user: 1,
  moderator: 2,
  manager: 2,
  admin: 3,
  super_admin: 4,
};

export const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userLevel = ROLE_LEVEL[user.role] || 0;
  const minRequiredLevel = Math.min(...allowedRoles.map(role => ROLE_LEVEL[role] || 0));
   console.log('User Level:', userLevel, 'Required Level:', minRequiredLevel);
  if (userLevel < minRequiredLevel) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};