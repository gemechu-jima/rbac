import { RoleGuard } from '../components/RoleGuard';

export default function SuperAdmin() {
  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold">This page for Super admin</h1>
        <p> Super Admins can see this.</p>
        {/* Admin controls here */}
      </div>
    </RoleGuard>
  );
}