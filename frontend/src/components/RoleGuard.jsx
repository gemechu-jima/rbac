// src/components/RoleGuard.jsx
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import {ROLES_CONFIG} from "../../../shares/role";
// Define role hierarchy (higher = more access)
const ROLE_LEVEL = {
  guest: 0,
  user: 1,
  manager: 2,
  admin: 3,
  super_admin: 4,
};

export const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userLevel = ROLES_CONFIG[user.role].level || 0;
  const minRequiredLevel = Math.min(...allowedRoles.map(role => ROLES_CONFIG[role] || 0));
   console.log('User Level:', userLevel, 'Required Level:', minRequiredLevel);
  if (userLevel < minRequiredLevel) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};