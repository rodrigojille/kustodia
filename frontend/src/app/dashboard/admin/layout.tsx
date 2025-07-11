'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminAccess = () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        router.push('/dashboard');
        return;
      }

      try {
        const decoded: { role: string } = jwtDecode(token);
        
        if (decoded.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
        
        setIsAdmin(true);
      } catch (error) {
        console.error('Failed to decode JWT:', error);
        router.push('/dashboard');
      }
    };

    checkAdminAccess();
  }, [router]);

  // Show loading while checking admin access
  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render admin content if user is admin
  return <>{children}</>;
};

export default AdminLayout;
