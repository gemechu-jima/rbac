// src/components/Navbar.jsx
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// Icons
import { FaUser, FaUsers, FaTools, FaShieldAlt, FaCogs, FaSignOutAlt, FaHome } from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-based nav items with icons
  const navItems = [];

  if (user) {
    navItems.push({
      label: 'Profile',
      path: '/app/profile',
      icon: <FaUser className="inline-block mr-1" />
    });
    
      if (["user", "moderator", "admin", "super_admin"].includes(user.role)) {
      navItems.push({
        label: "Users",
        path: "/app/users",
        icon: <FaUser className="text-lg" />,
      });
    }
    if (['manager', 'admin', 'super_admin'].includes(user.role)) {
      navItems.push({
        label: 'Team',
        path: '/app/manager',
        icon: <FaUsers className="inline-block mr-1" />
      });
    }

    if (['admin', 'super_admin'].includes(user.role)) {
      navItems.push({
        label: 'Admin',
        path: '/app/admin',
        icon: <FaTools className="inline-block mr-1" />
      });
    }

    if (user.role === 'super_admin') {
      navItems.push({
        label: 'System',
        path: '/app/super-admin',
        icon: <FaCogs className="inline-block mr-1" />
      });
    }
  }

  return (
    <nav className="bg-blue-600 text-white p-4 shadow">
      <div className="container mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="font-bold text-xl flex items-center gap-2">
          <FaHome />
          MyApp
        </Link>

        {/* Right side */}
        {user ? (
          <div className="flex items-center gap-6">

            {/* User info */}
            <span className="text-sm">
              Hi, {user.name} ({user.role})
            </span>

            {/* Dynamic nav items */}
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="hover:underline flex items-center"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center text-red-200 hover:text-white"
            >
              <FaSignOutAlt className="mr-1" />
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="hover:underline">Login</Link>
        )}
      </div>
    </nav>
  );
}