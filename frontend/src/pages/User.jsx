import { RoleGuard } from '../components/RoleGuard';

export default function User() {
  return (
    <RoleGuard allowedRoles={["user",'manager','moderator','admin', 'super_admin']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold">user Settings</h1>
        <p>User & bove can manage content..</p>
        {/* Admin controls here */}
      </div>
    </RoleGuard>
  );
}