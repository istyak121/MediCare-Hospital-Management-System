'use client';
import { useAuthStore } from '@/stores/authStore';
import { User } from 'lucide-react';

export default function PortalProfile() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text-primary">My Profile</h1>
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-text-primary">{user?.email}</p>
            <p className="text-sm text-text-muted capitalize">{user?.role}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-muted">Email</label>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>
          <div>
            <label className="text-xs text-text-muted">Role</label>
            <p className="text-sm font-medium capitalize">{user?.role}</p>
          </div>
          <div>
            <label className="text-xs text-text-muted">User ID</label>
            <p className="text-sm font-mono">{user?.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
