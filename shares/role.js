// shared/roles.js

export const ROLES_CONFIG = {
  guest: {
    label: "Guest",
    permissions: ["read:public"],
    role:["guest","user","manager","admin","super_admin"],
    level:0
  },
  user: {
    label: "User",
    permissions: ["read:own", "write:own", "read:public"],
    role:["user","manager","admin","super_admin"],
    level:1
  },
  manager: {
    label: "Manager",
    permissions: ["read:own", "write:own", "read:team", "approve:requests"],
    role:["manager","admin","super_admin"],
    level:2
  },
  admin: {
    label: "Admin ",
    permissions: ["*"],
    role:["admin","super_admin"],
    level:3
  },
  super_admin: {
    label: "Super Admin (System owner)",
    permissions: ["**"],
    role:["super_admin"],
    level:4
  },
};

export const ROLE_PERMISSIONS = Object.fromEntries(
  Object.entries(ROLES_CONFIG).map(([role, config]) => [role, config.permissions])
);

export const ROLES = Object.entries(ROLES_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));