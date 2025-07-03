'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import authFetch from '@/lib/api';

interface User {
  id: number;
  email: string;
  role: string;
}

interface TicketReply {
  id: string;
  message: string;
  createdAt: string;
  user: User;
}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  user: User;
  userId: number;
  replies: TicketReply[];
}

const TicketDetailPage = () => {
  const params = useParams();
  const { id } = params;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
    const [replyError, setReplyError] = useState<string | null>(null);

  const [isClosing, setIsClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchTicket = async () => {
        try {
          setLoading(true);
          const response = await authFetch(`/api/tickets/${id}`);
          if (!response.ok) {
            throw new Error('No se pudo cargar el ticket.');
          }
          const data = await response.json();
          setTicket(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchTicket();
    }
    }, [id]);

  const handleCloseTicket = async () => {
    if (!ticket || ticket.status === 'closed') return;

    setIsClosing(true);
    setCloseError(null);

    try {
      const response = await authFetch(`/api/tickets/${ticket.id}/close`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cerrar el ticket');
      }

      const updatedTicket = await response.json();
      setTicket(updatedTicket);

    } catch (err: any) {
      setCloseError(err.message);
    } finally {
      setIsClosing(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !ticket) return;

    setIsReplying(true);
    setReplyError(null);

    try {
      const response = await authFetch(`/api/tickets/${ticket.id}/replies`, {
        method: 'POST',
        body: JSON.stringify({ message: replyMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar la respuesta');
      }

      const newReply = await response.json();

      setTicket(prevTicket => {
        if (!prevTicket) return null;
        const updatedReplies = [...prevTicket.replies, newReply].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return {
          ...prevTicket,
          replies: updatedReplies,
        };
      });

      setReplyMessage('');
    } catch (err: any) {
      setReplyError(err.message);
    } finally {
      setIsReplying(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Cargando ticket...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!ticket) {
    return <div className="text-center p-8">No se encontró el ticket.</div>;
  }

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const allMessages = [
    { 
      id: ticket.id,
      message: ticket.message,
      createdAt: ticket.createdAt,
      user: ticket.user,
      isOriginal: true
    },
    ...(ticket.replies || []).map(r => ({...r, isOriginal: false}))
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/dashboard/soporte" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Regresar al Centro de Soporte
        </Link>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
                <div className="flex flex-wrap gap-4 justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{ticket.subject}</h1>
            <p className="text-sm text-gray-500 mt-1">Ticket #{ticket.id}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusClass(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              {ticket.status !== 'closed' && (
                <button
                  onClick={handleCloseTicket}
                  disabled={isClosing}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClosing ? 'Cerrando...' : 'Cerrar Ticket'}
                </button>
              )}
            </div>
            {closeError && <p className="text-red-500 text-sm mt-2">{closeError}</p>}
          </div>
        </div>

        {/* Chat Timeline */}
        <div className="mt-6 bg-slate-50 p-4 rounded-lg space-y-6 h-[50vh] overflow-y-auto">
          {allMessages.map((msg) => {
                            const isOwner = msg.user.role !== 'admin';
              return (
                <div key={msg.id} className={`flex items-start gap-3 ${isOwner ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${isOwner ? 'bg-primary' : 'bg-gray-400'}`}>
                    {msg.user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl max-w-lg ${isOwner ? 'bg-primary text-black rounded-br-lg' : 'bg-white text-gray-800 border border-slate-200 rounded-bl-lg'}`}>
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold text-sm">{msg.user.email} {msg.user.role === 'admin' && <span className="font-normal opacity-80">(Soporte)</span>}</p>
                      <p className="text-xs opacity-80">{new Date(msg.createdAt).toLocaleString('es-MX')}</p>
                    </div>
                    <p className="whitespace-pre-wrap mt-1">{msg.message}</p>
                  </div>
                </div>
              );
          })}
        </div>

        {/* Reply Form */}
        {ticket.status !== 'closed' && (
          <div className="mt-6 border-t pt-6">
            <form onSubmit={handleReplySubmit} className="relative">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full p-4 pr-16 bg-slate-100 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
                rows={3}
                placeholder="Escribe tu respuesta aquí..."
                disabled={isReplying}
              />
              <div className="absolute right-3 top-3">
                <button
                  type="submit"
                  className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isReplying || !replyMessage.trim()}
                >
                  {isReplying ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
            {replyError && <p className="text-red-500 text-sm mt-2">{replyError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailPage;
