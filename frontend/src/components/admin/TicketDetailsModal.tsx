'use client';

import { useEffect, useState } from 'react';
import authFetch from '@/utils/authFetch';

interface User {
  id: number;
  email: string;
  name?: string;
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

interface TicketDetailsModalProps {
  ticketId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketDetailsModal({ ticketId, isOpen, onClose }: TicketDetailsModalProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchTicket();
    }
  }, [isOpen, ticketId]);

  const fetchTicket = async () => {
    if (!ticketId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Use admin API to fetch ticket details
      const response = await authFetch(`/api/admin/tickets/${ticketId}`);
      
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

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !ticket) return;

    setIsReplying(true);
    setReplyError(null);

    try {
      // Use admin API to reply to ticket
      const response = await authFetch(`/api/admin/tickets/${ticket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: replyMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al enviar la respuesta');
      }

      const newReply = await response.json();

      setTicket(prevTicket => {
        if (!prevTicket) return null;
        const updatedReplies = [...prevTicket.replies, newReply].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
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

  const handleCloseTicket = async () => {
    if (!ticket || ticket.status === 'CLOSED') return;

    setIsClosing(true);

    try {
      const response = await authFetch(`/api/admin/tickets/${ticket.id}/close`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cerrar el ticket');
      }

      const updatedTicket = await response.json();
      setTicket(updatedTicket);
    } catch (err: any) {
      console.error('Error closing ticket:', err);
    } finally {
      setIsClosing(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN': return 'Abierto';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'CLOSED': return 'Cerrado';
      default: return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Ticket #{ticketId?.substring(0, 8)}...
            </h2>
            {ticket && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClass(ticket.status)}`}>
                {getStatusText(ticket.status)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto bg-white" style={{ backgroundColor: '#ffffff' }}>
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando ticket...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600">
              Error: {error}
            </div>
          )}

          {ticket && !loading && (
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600">
                      <strong>Usuario:</strong> {ticket.user.name || ticket.user.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> {ticket.user.email}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Creado:</strong> {new Date(ticket.createdAt).toLocaleString('es-MX')}
                    </p>
                    {ticket.status !== 'CLOSED' && (
                      <button
                        onClick={handleCloseTicket}
                        disabled={isClosing}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isClosing ? 'Cerrando...' : 'Cerrar Ticket'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Timeline */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4 max-h-96 overflow-y-auto">
                {/* Original message */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold">
                    {(ticket.user.name || ticket.user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-lg max-w-lg border border-gray-200">
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="font-semibold text-sm">{ticket.user.name || ticket.user.email}</p>
                      <p className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleString('es-MX')}</p>
                    </div>
                    <p className="whitespace-pre-wrap">{ticket.message}</p>
                  </div>
                </div>

                {/* Replies */}
                {ticket.replies?.map((reply) => {
                  const isAdmin = reply.user.role === 'admin';
                  return (
                    <div key={reply.id} className={`flex items-start gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${
                        isAdmin ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        {(reply.user.name || reply.user.email).charAt(0).toUpperCase()}
                      </div>
                      <div className={`px-4 py-3 rounded-2xl max-w-lg border ${
                        isAdmin 
                          ? 'bg-green-50 border-green-200 rounded-br-lg' 
                          : 'bg-white border-gray-200 rounded-bl-lg'
                      }`}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <p className="font-semibold text-sm">
                            {reply.user.name || reply.user.email}
                            {isAdmin && <span className="font-normal text-green-600 ml-1">(Admin)</span>}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleString('es-MX')}</p>
                        </div>
                        <p className="whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              {ticket.status !== 'CLOSED' && (
                <div className="border-t pt-6">
                  <form onSubmit={handleReplySubmit} className="relative">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="w-full p-4 pr-16 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                      rows={3}
                      placeholder="Escribe tu respuesta como administrador..."
                      disabled={isReplying}
                    />
                    <div className="absolute right-3 top-3">
                      <button
                        type="submit"
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
          )}
        </div>
      </div>
    </div>
  );
}
