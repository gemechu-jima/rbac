import { RoleGuard } from '../components/RoleGuard';

export default function SuperAdmin() {
  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p>Only Admins & Super Admins can see this.</p>
        {/* Admin controls here */}
      </div>
    </RoleGuard>
  );
}