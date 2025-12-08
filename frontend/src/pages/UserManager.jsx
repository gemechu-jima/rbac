// src/pages/UserManagement.jsx
import { useState } from 'react';
import UserForm from '../components/UserForm';

export default function UserManagement() {
  const [editingUser, setEditingUser] = useState(null);

  // Mock API call
  const handleSaveUser = async (userData) => {
    if (editingUser) {
      console.log('Update user:', userData);
      // PUT /api/users/:id
    } else {
      console.log('Create user:', userData);
      // POST /api/users
    }
    setEditingUser(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {/* Form */}
      <UserForm
        initialData={editingUser}
        onSubmit={handleSaveUser}
        onCancel={() => setEditingUser(null)}
      />

      {/* Optional: User list table here */}
    </div>
  );
}