'use client';

import React from 'react';

interface Ticket {
  id: number;
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  user: {
    email: string;
  };
}

interface SupportTicketsTableProps {
  tickets: Ticket[];
}

const statusStyles: { [key: string]: string } = {
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-gray-100 text-gray-800',
};

const SupportTicketsTable: React.FC<SupportTicketsTableProps> = ({ tickets }) => {
  if (tickets.length === 0) {
    return <p className="text-center text-gray-500 py-8">No hay tickets de soporte.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{ticket.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 truncate" style={{ maxWidth: '300px' }}>{ticket.subject}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[ticket.status]}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupportTicketsTable;
