// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/NavBar";
import Login from "./components/Login";
import Protect from "./pages/Protect";
import AppLayout from "./pages/AppLayout";
import Profile from "./pages/Profiles";
import SuperAdmin from "./pages/SuperAdmin";
import Admin from "./pages/Admin";
import Manager from "./pages/Manager";
import User from "./pages/User";
import Guest from "./pages/Guest";
import { RoleGuard } from "./components/RoleGuard";
import {ROLES_CONFIG} from "../../shares/role";
console.log(ROLES_CONFIG);
function App() {
  const location = useLocation();
  return (
    <>
      {!location.pathname.startsWith("/app") && <Navbar />}
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/app"
            element={
              <Protect>
                <AppLayout />
              </Protect>
            }
          >
            <Route path="profile" element={<Profile />} />
            <Route
              path="super-admin"
              element={
                <RoleGuard allowedRoles={ROLES_CONFIG.super_admin.role}>
                  <SuperAdmin />
                </RoleGuard>
              }
            />
            <Route
              path="admin"
              element={
                <RoleGuard allowedRoles={ROLES_CONFIG.admin.role}>
                  <Admin />
                </RoleGuard>
              }
            />
            <Route
              path="manager"
              element={
                <RoleGuard allowedRoles={ROLES_CONFIG.manager.role}>
                  <Manager />
                </RoleGuard>
              }
            />
            <Route
              path="users"
              element={
                <RoleGuard
                  allowedRoles={ROLES_CONFIG.user.role}
                >
                  <User />
                </RoleGuard>
              }
            />
            <Route path="guest" element={<Guest />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}

export default App;
