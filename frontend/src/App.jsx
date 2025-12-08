// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Navbar from './components/NavBar';
import Login from './pages/Login';
import Profile from './pages/Profiles';
import AdminSettings from './pages/AdminSettings';
import ContentModeration from './pages/ContentModeration';
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/moderation" element={<ContentModeration />} />
            <Route path="/admin" element={<AdminSettings />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;