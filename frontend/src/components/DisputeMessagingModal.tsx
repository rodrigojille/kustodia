'use client';

import React, { useState, useEffect, useRef } from 'react';

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

interface DisputeMessagingModalProps {
  escrowId: number;
  isOpen: boolean;
  onClose: () => void;
}

const DisputeMessagingModal: React.FC<DisputeMessagingModalProps> = ({
  escrowId,
  isOpen,
  onClose
}) => {
  const [dispute, setDispute] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittingMessage, setSubmittingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && escrowId) {
      fetchDisputeInfo();
    }
  }, [isOpen, escrowId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchDisputeInfo = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // Find dispute by escrow ID
      const disputesResponse = await fetch('/api/dispute', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (disputesResponse.ok) {
        const disputesData = await disputesResponse.json();
        const currentDispute = disputesData.find((d: any) => d.escrow.id === escrowId);
        
        if (currentDispute) {
          setDispute(currentDispute);
          await fetchMessages(currentDispute.id);
        }
      }
    } catch (error) {
      console.error('Error fetching dispute info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (disputeId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/disputes/${disputeId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

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
    if (!dispute) return;

    setSubmittingMessage(true);
    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('message', newMessage.trim() || 'Archivo adjunto');
      
      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }

      const response = await fetch(`/api/disputes/${dispute.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Mensajes de Disputa
            </h2>
            {dispute && (
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                  {getStatusLabel(dispute.status)}
                </span>
                <span className="text-sm text-gray-600">
                  • {dispute.reason}
                </span>
              </div>
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
          <>
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No hay mensajes aún.</p>
                  <p className="text-sm mt-1">Puedes enviar un mensaje o adjuntar más evidencia.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_admin ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.is_admin 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs ${message.is_admin ? 'text-gray-600' : 'text-blue-200'}`}>
                          {getMessageTypeIcon(message.message_type)} {message.is_admin ? 'Administrador' : 'Tú'}
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
                              message.is_admin ? 'text-blue-600' : 'text-blue-200'
                            }`}
                          >
                            📎 {message.attachment_name}
                          </a>
                        </div>
                      )}
                      <div className={`text-xs mt-1 ${message.is_admin ? 'text-gray-500' : 'text-blue-200'}`}>
                        {formatDate(message.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {dispute && dispute.status === 'pending' && (
              <div className="border-t p-4">
                <div className="flex flex-col gap-3">
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
                        rows={3}
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
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: Puedes adjuntar evidencia adicional o hacer preguntas sobre tu disputa
                  </p>
                </div>
              </div>
            )}

            {dispute && dispute.status !== 'pending' && (
              <div className="border-t p-4 bg-gray-50">
                <div className="text-center text-gray-600">
                  <p className="text-sm">
                    {dispute.status === 'approved' ? 
                      '✅ Esta disputa ha sido aprobada. Tu reembolso ha sido procesado.' :
                      '❌ Esta disputa ha sido rechazada y está cerrada.'}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DisputeMessagingModal;
