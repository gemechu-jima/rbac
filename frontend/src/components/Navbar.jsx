// src/components/Navbar.jsx
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Icons
import { FaUser, FaUsers, FaTools, FaShieldAlt, FaCogs, FaSignOutAlt, FaHome } from 'react-icons/fa';

export default function Navbar() {
  const { user, logout, setIsLogin } = useAuth();

  const handleLogout = () => {
    logout();
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
  <div className="max-w-7xl mx-auto flex justify-between items-center">

    <Link to="/" className="font-bold text-xl flex items-center gap-2 ">
      <FaHome />
      MyApp
    </Link>
    {user ? (
      <div className="flex items-center gap-6">

        <span className="text-sm">
          Hi, {user.name} ({user.role})
        </span>

        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className="hover:underline flex items-center gap-1"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="flex items-center text-red-400 hover:text-white "
        >
          <FaSignOutAlt className="mr-1" />
          Logout
        </button>
      </div>
    ) : (
      <button
        onClick={() => setIsLogin(prev => !prev)}
        className="rounded-md px-3 py-2 "
      >
        Login
      </button>
    )}
  </div>
</nav>
  );
}