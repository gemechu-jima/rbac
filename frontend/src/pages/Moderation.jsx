// src/pages/ContentModeration.jsx
import { RoleGuard } from '../components/RoleGuard';

export default function Moderation() {
  return (
    <RoleGuard allowedRoles={['moderator', 'admin', 'super_admin']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Content Moderation</h1>
        <p>Moderators and above can manage content.</p>
      </div>
    </RoleGuard>
  );
}