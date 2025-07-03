'use client';

import React from 'react';
import Link from 'next/link';

interface Ticket {
  id: number;
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
}

interface MyTicketsListProps {
  tickets: Ticket[];
}

const statusStyles: { [key: string]: string } = {
  open: 'bg-emerald-100 text-emerald-800',
  in_progress: 'bg-amber-100 text-amber-800',
  closed: 'bg-slate-100 text-slate-700',
};

const borderStyles: { [key: string]: string } = {
  open: 'border-l-4 border-emerald-500',
  in_progress: 'border-l-4 border-amber-500',
  closed: 'border-l-4 border-slate-400',
};

const statusText: { [key: string]: string } = {
    open: 'Abierto',
    in_progress: 'En Progreso',
    closed: 'Cerrado',
  };

const MyTicketsList: React.FC<MyTicketsListProps> = ({ tickets }) => {
  if (tickets.length === 0) {
    return <p className="text-center text-gray-500 py-4">No has enviado ningún ticket todavía.</p>;
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <Link href={`/dashboard/soporte/${ticket.id}`} key={ticket.id} className="block">
          <div className={`bg-white p-4 rounded-md shadow-sm border-y border-r border-gray-200 hover:shadow-md hover:border-primary-light transition-all duration-200 cursor-pointer flex justify-between items-center ${borderStyles[ticket.status]}`}>
            <div>
              <p className="font-semibold text-gray-900">{ticket.subject}</p>
              <p className="text-sm text-gray-500">Ticket #{ticket.id} - Creado: {new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[ticket.status]}`}>
              {statusText[ticket.status]}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MyTicketsList;
