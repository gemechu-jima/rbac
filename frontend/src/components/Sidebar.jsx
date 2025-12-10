// src/components/Sidebar.jsx
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ROLES_CONFIG } from "../../../shares/role";
// Icons
import {
  FaUser,
  FaUsers,
  FaTools,
  FaShieldAlt,
  FaCogs,
  FaSignOutAlt,
  FaHome,
} from "react-icons/fa";
console.log("ROLES_CONFIG in Sidebar:", ROLES_CONFIG.super_admin.role[0]);
export default function Sidebar({ isSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Role-based nav items
  const navItems = [];

  if (user) {
    navItems.push({
      label: "Profile",
      path: "/app/profile",
      icon: <FaUser className="text-lg" />,
    });
    if (ROLES_CONFIG.user.role.includes(user.role)) {
      navItems.push({
        label: "Users",
        path: "/app/users",
        icon: <FaUser className="text-lg" />,
      });
    }

    if (ROLES_CONFIG.manager.role.includes(user.role)) {
      navItems.push({
        label: "Team Manager",
        path: "/app/manager",
        icon: <FaUsers className="text-lg" />,
      });
    }

    if (ROLES_CONFIG.admin.role.includes(user.role)) {
      navItems.push({
        label: "Admin",
        path: "/app/admin",
        icon: <FaTools className="text-lg" />,
      });
    }

    if (user.role === ROLES_CONFIG.super_admin.role) {
      navItems.push({
        label: "System",
        path: "/app/super-admin",
        icon: <FaCogs className="text-lg" />,
      });
    }
  }

  return (
    <aside
      className={`dark:bg-gray-950 bg-gray-800 text-white h-screen flex flex-col shadow-lg transition-all duration-300 
      ${isSidebarOpen ? "w-64" : "w-[72px]"}`}
    >
      <div className="p-4 flex items-center gap-3 border-b border-gray-700">
        <FaHome className="text-2xl" />
        {isSidebarOpen && <span className="text-xl font-bold">MyApp</span>}
      </div>

     
      {user && (
        <div className="p-4 border-b border-gray-700">
          {isSidebarOpen ? (
            <>
              <p className="font-semibold">{user.name}</p>
              <p className="text-blue-300 text-sm">{user.role}</p>
            </>
          ) : (
            <div className="flex justify-center">
              <FaUser className="text-xl text-blue-300" />
            </div>
          )}
        </div>
      )}

      <nav className="flex-1 p-3 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-600 transition"
          >
            <span className="text-xl">{item.icon}</span>
            {isSidebarOpen && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      {user && (
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-4 text-red-500  hover:text-red-700 transition"
        >
          <FaSignOutAlt className="text-xl" />
          {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      )}
    </aside>
  );
}
