import { render, screen } from '@testing-library/react';
import Layout from '@/components/Layout';
import React from 'react';

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() })
}));

jest.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 1, name: 'Test', email: 'test@example.com' },
    hydrate: jest.fn(),
    clearAuth: jest.fn()
  })
}));

describe('Layout', () => {
  it('renders navigation items', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});


