export const ROLE_PERMISSIONS = {
  guest: ["read:public"],
  user: ["read:own", "write:own", "read:public"],
  moderator: ["read:own", "write:own", "read:public", "moderate:content"],
  manager: ["read:own", "write:own", "read:team", "approve:requests"],
  admin: ["*"],          
  super_admin: ["**"],   
};