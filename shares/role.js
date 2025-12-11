// shared/roles.js

export const ROLES_CONFIG = {
  guest: {
    label: "Guest",
    permissions: ["read:public"],
    role: ["guest", "user", "manager", "admin", "super_admin"],
    level: 0,
  },

  user: {
    label: "User",
    permissions: ["read:public", "read:self", "write:self"],
    role: ["user", "manager", "admin", "super_admin"],
    level: 1,
  },

  manager: {
    label: "Manager",
    permissions: ["read:public", "read:team", "write:team", "approve:requests"],
    role: ["manager", "admin", "super_admin"],
    level: 2,
  },

  admin: {
    label: "Admin",
    permissions: ["read:*","write:*","delete:*","manage:users","manage:settings",
    ],
    role: ["admin", "super_admin"],
    level: 3,
  },

  super_admin: {
    label: "Super Admin (System owner)",
    permissions: ["admin:*", "system:*"],
    role: ["super_admin"],
    level: 4,
  },
};

export const ROLE_PERMISSIONS = Object.fromEntries(
  Object.entries(ROLES_CONFIG).map(([role, config]) => [
    role,
    config.permissions,
  ])
);

export const ROLES = Object.entries(ROLES_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

// Permission Naming Convention

// read:self → Can read own data
// read:* → Can read something
// write:* → Can create or update
// delete:* → Can remove
// manage:* → Full control
// admin:* → Full system admin
// system:* → Root-level power (superadmins only)