
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { ROLES_CONFIG } from "../../../shares/role";

export const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login"  />;
  }

  const userLevel = ROLES_CONFIG[user.role].level || 0;
  const minRequiredLevel = Math.max(
    ...allowedRoles.map((role) => ROLES_CONFIG[role] || 0)
  );
  console.log("User Level:", userLevel, "Required Level:", minRequiredLevel);

  if (userLevel < minRequiredLevel) {
    return <Navigate to="/unauthorized"/>;
  }

  return children;
};
