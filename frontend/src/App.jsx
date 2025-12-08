// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Navbar from './components/NavBar';
import Login from './components/Login';
import AppLayout from './pages/AppLayout';
import Profile from './pages/Profiles';
import SuperAdmin from './pages/SuperAdmin';
import Admin from './pages/Admin';
import Moderation from './pages/Moderation';
import Manager from './pages/Manager';
import User from './pages/User';
import Guest from './pages/Guest';
const location = window.location.pathname;
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
       {location.startsWith('/app') ?'': <Navbar />}
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route  path="/app" element={<AppLayout />}>
            <Route path="super-admin" element={<SuperAdmin />} />
            <Route path="admin" element={<Admin />} />
            <Route path="manager" element={<Manager />} />
            <Route path="moderation" element={<Moderation />} />
            <Route path="user" element={<User />} />
            <Route path="guest" element={<Guest />} />
          </Route>
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;