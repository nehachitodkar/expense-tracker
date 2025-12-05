"use client";

import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <Layout>
      <div className="max-w-xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
          <p className="text-sm text-slate-500">
            View your account information.
          </p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
          {user ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Name</dt>
                <dd className="text-slate-900 font-medium">{user.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Email</dt>
                <dd className="text-slate-900 font-medium">{user.email}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-slate-500">
              No user information available. Please log in again.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}


