'use client';

import React, { useState, useEffect } from 'react';
import authFetch from '../../../lib/api';
import SupportTicketsTable from '../../../components/admin/SupportTicketsTable';

interface Ticket {
  id: number;
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  user: {
    email: string;
  };
}

const AdminDashboardPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await authFetch('/api/admin/tickets');
        if (!response.ok) {
          throw new Error('Failed to fetch tickets');
        }
        const data = await response.json();
        setTickets(data);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Panel de Administración</h1>
      
      <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Tickets de Soporte</h2>
        
        {loading && <p className="text-center text-gray-500">Cargando tickets...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        
        {!loading && !error && (
          <SupportTicketsTable tickets={tickets} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
