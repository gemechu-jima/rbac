// src/components/Navbar.jsx
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Show different nav items based on role
  const navItems = [];
  if (user) {
    navItems.push({ label: 'Profile', path: '/profile' });
    
    if (['moderator', 'admin', 'super_admin'].includes(user.role)) {
      navItems.push({ label: 'Moderation', path: '/app/moderation' });
    }

    if (['manager', 'admin', 'super_admin'].includes(user.role)) {
      navItems.push({ label: 'Team', path: '/app/manager' });
    }

    if (['admin', 'super_admin'].includes(user.role)) {
      navItems.push({ label: 'Admin', path: '/app/admin' });
    }

    if (user.role === 'super_admin') {
      navItems.push({ label: 'System', path: '/app/super-admin' });
    }
  }

  return (
    <nav className="bg-blue-600 text-white p-4 shadow">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">MyApp</Link>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm">Hi, {user.name} ({user.role})</span>
            {navItems.map(item => (
              <Link key={item.path} to={item.path} className="hover:underline">
                {item.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="text-red-200 hover:text-white">
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