'use client';

import React, { useState, useEffect, useRef } from 'react';
import { authFetch } from '../../utils/authFetch';

interface Message {
  id: string;
  message: string;
  message_type: 'initial' | 'user_message' | 'admin_message' | 'evidence' | 'system';
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  created_at: string;
  is_admin: boolean;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface DisputeDetail {
  id: number;
  reason: string;
  details: string;
  evidence_url?: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  raisedBy: {
    id: number;
    name: string;
    email: string;
  };
  escrow: {
    id: number;
    amount: string;
    payment: {
      id: number;
      amount: number;
      description: string;
    };
  };
  messages: Message[];
}

interface DisputeDetailsModalProps {
  disputeId: number;
  isOpen: boolean;
  onClose: () => void;
  onResolve?: (disputeId: number, action: 'approve' | 'reject', notes?: string) => void;
}

const DisputeDetailsModal: React.FC<DisputeDetailsModalProps> = ({
  disputeId,
  isOpen,
  onClose,
  onResolve
}) => {
  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittingMessage, setSubmittingMessage] = useState(false);
  const [resolving, setResolving] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && disputeId) {
      fetchDisputeDetails();
      fetchMessages();
    }
  }, [isOpen, disputeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchDisputeDetails = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`disputes/${disputeId}/details`);

      if (response.ok) {
        const data = await response.json();
        setDispute(data.dispute);
      } else {
        console.error('Failed to fetch dispute details');
      }
    } catch (error) {
      console.error('Error fetching dispute details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await authFetch(`disputes/${disputeId}/messages`);

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    setSubmittingMessage(true);
    try {
      const formData = new FormData();
      formData.append('message', newMessage.trim() || 'Archivo adjunto');
      
      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }

      // Use fetch with credentials for multipart/form-data upload
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`/api/disputes/${disputeId}/messages`, {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSubmittingMessage(false);
    }
  };

  const handleResolveDispute = async (action: 'approve' | 'reject') => {
    if (!onResolve) return;
    
    setResolving(action);
    try {
      await onResolve(disputeId, action, adminNotes);
      onClose();
    } catch (error) {
      console.error('Error resolving dispute:', error);
    } finally {
      setResolving(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'evidence': return '📎';
      case 'admin_message': return '👨‍💼';
      case 'system': return '⚙️';
      default: return '💬';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Disputa #{disputeId}
            </h2>
            {dispute && (
              <p className="text-sm text-gray-600 mt-1">
                Creada por {dispute.raisedBy.name} • {formatDate(dispute.created_at)}
              </p>
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

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Dispute Info */}
            <div className="w-1/3 border-r bg-gray-50 p-4 overflow-y-auto">
              {dispute && (
                <div className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      dispute.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      dispute.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {dispute.status === 'pending' ? 'Pendiente' :
                       dispute.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                    </span>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h3 className="font-medium text-gray-900 mb-2">Información del Pago</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Monto:</span> ${dispute.escrow.payment.amount}</p>
                      <p><span className="font-medium">Descripción:</span> {dispute.escrow.payment.description}</p>
                      <p><span className="font-medium">Custodia:</span> ${dispute.escrow.amount}</p>
                    </div>
                  </div>

                  {/* Dispute Details */}
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h3 className="font-medium text-gray-900 mb-2">Detalles de la Disputa</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Motivo:</span> {dispute.reason}</p>
                      <div>
                        <span className="font-medium">Descripción:</span>
                        <p className="mt-1 whitespace-pre-wrap">{dispute.details}</p>
                      </div>
                    </div>
                  </div>

                  {/* Original Evidence */}
                  {dispute.evidence_url && (
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <h3 className="font-medium text-gray-900 mb-2">Evidencia Original</h3>
                      <a 
                        href={dispute.evidence_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        Ver evidencia adjunta
                      </a>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {dispute.status === 'pending' && onResolve && (
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <h3 className="font-medium text-gray-900 mb-2">Notas de Resolución</h3>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Notas administrativas (opcional)..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleResolveDispute('approve')}
                          disabled={resolving !== null}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          {resolving === 'approve' ? 'Aprobando...' : 'Aprobar'}
                        </button>
                        <button
                          onClick={() => handleResolveDispute('reject')}
                          disabled={resolving !== null}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          {resolving === 'reject' ? 'Rechazando...' : 'Rechazar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Panel - Messages */}
            <div className="flex-1 flex flex-col">
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_admin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.is_admin 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs opacity-75">
                          {getMessageTypeIcon(message.message_type)} {message.user.name}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      {message.attachment_url && (
                        <div className="mt-2">
                          <a
                            href={message.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs underline ${
                              message.is_admin ? 'text-blue-200' : 'text-blue-600'
                            }`}
                          >
                            📎 {message.attachment_name}
                          </a>
                        </div>
                      )}
                      <div className="text-xs opacity-75 mt-1">
                        {formatDate(message.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex flex-col gap-2">
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <span>📎 {selectedFile.name}</span>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribir mensaje..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      accept="image/*,application/pdf,.doc,.docx,.txt,video/*"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md"
                      title="Adjuntar archivo"
                    >
                      📎
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={submittingMessage || (!newMessage.trim() && !selectedFile)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                      {submittingMessage ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeDetailsModal;
