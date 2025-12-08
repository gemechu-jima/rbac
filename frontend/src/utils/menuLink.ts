
import { CiUser } from "react-icons/ci";
import { CiHome, CiSettings } from "react-icons/ci";
import { MdOutlineMiscellaneousServices } from "react-icons/md";
import { MdOutlineDashboard } from "react-icons/md";
import { MdOutlineAnalytics } from "react-icons/md";
import { MdAppRegistration } from "react-icons/md";


export const menuItems = [
  { label: 'Home', icon:CiHome, route: '/' },
  { label: 'About Us', route: '/about' },
  { label: 'Contact', route: '/contact' },
];




export const sidebarItems = [
  { label: "Dashboard", icon: MdOutlineDashboard, route: "/" },
  {label:"Super Admin", icon:MdAppRegistration, route:"/super-admin"},
  { label: "Admin", icon: MdOutlineMiscellaneousServices, route: "/admin" },
  { label: "Manager", icon: MdOutlineAnalytics, route: "/manager" },
  { label: "Moderatoer", icon: CiSettings, route: "/moderation" },
  { label: "Users", icon: CiUser, route: "/users" },
  { label: "Guest", icon: CiUser, route: "/guest" },
];

export const services = [
  {
    id: "auth-service",
    name: "Authentication Service",
    status: "UP", // healthy | degraded | down
    version: "1.2.4",
    instances: 3,
    lastHeartbeat: "2025-01-11T10:45:12Z",
    ip: "172.20.108.179:2000",
  },
  {
    id: "user-service",
    name: "User Service",
    status: "UP",
    version: "1.0.8",
    instances: 2,
    lastHeartbeat: "2025-01-11T10:45:20Z",
    ip: "172.20.108.179:2001",
  },
  {
    id: "service-register",
    name: "Payment Service",
    status: "DEGRADED",
    version: "2.3.1",
    instances: 1,
    lastHeartbeat: "2025-01-11T10:44:59Z",
    ip: "172.20.108.179:2002",
  },
  {
    id: "notification-service",
    name: "Notification Service",
    status: "down",
    version: "3.1.0",
    instances: 0,
    lastHeartbeat: "2025-01-11T10:40:10Z",
    ip: "172.20.108.179:2003",
  },
];

export const servicesDetails = [
  {
    id: "auth-service",
    name: "Authentication Service",
    ip: "172.20.108.179:2000",
    status: "healthy",
    instances: [
      { instanceId: "auth-1", cpu: 12, memory: 480, uptime: "12h 45m" },
      { instanceId: "auth-2", cpu: 18, memory: 520, uptime: "8h 22m" },
      { instanceId: "auth-3", cpu: 9, memory: 450, uptime: "4h 53m" },
    ],
    version: "1.2.4",
    lastChecked: "2025-01-11 10:46",
    registeredAt: "2024-07-02",
  },
  {
    id: "payment-service",
    name: "Payment Service",
    ip: "172.20.108.179:2002",
    status: "degraded",
    instances: [
      { instanceId: "pay-1", cpu: 68, memory: 880, uptime: "3h 10m" },
    ],
    version: "2.3.1",
    lastChecked: "2025-01-11 10:45",
    registeredAt: "2024-08-10",
  },
  {
    id: "order-service",
    name: "Order Service",
    ip: "172.20.108.179:2004",
    status: "healthy",
    instances: [
      { instanceId: "order-1", cpu: 14, memory: 600, uptime: "22h 01m" },
      { instanceId: "order-2", cpu: 20, memory: 710, uptime: "15h 33m" },
    ],
    version: "1.4.0",
    lastChecked: "2025-01-11 10:46",
    registeredAt: "2024-09-01",
  },
  {
    id: "notification-service",
    name: "Notification Service",
    ip: "172.20.108.179:2003",
    status: "down",
    instances: [],
    version: "3.1.0",
    lastChecked: "2025-01-11 10:38",
    registeredAt: "2024-07-15",
  },
];

export const servicesCompact = [
  {
    name: "Auth Service",
    status: "healthy",
    ip: "172.20.108.179:2000",
    uptime: "12h 45m",
    cpu: 12,
    memory: 480,
  },
  {
    name: "User Service",
    status: "healthy",
    ip: "172.20.108.179:2001",
    uptime: "9h 12m",
    cpu: 25,
    memory: 650,
  },
  {
    name: "Payment Service",
    status: "degraded",
    ip: "172.20.108.179:2002",
    uptime: "3h 10m",
    cpu: 68,
    memory: 880,
  },
  {
    name: "Notification Service",
    status: "down",
    ip: "172.20.108.179:2003",
    uptime: "0h",
    cpu: 0,
    memory: 0,
  },
];


