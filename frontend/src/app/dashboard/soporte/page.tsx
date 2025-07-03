'use client';

import React, { useState, useEffect } from 'react';
import authFetch from '../../../lib/api';
import MyTicketsList from '../../../components/soporte/MyTicketsList';
import FAQ from '../../../components/FAQ';

interface Ticket {
  id: number;
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
}

const SupportPage = () => {
  const [activeTab, setActiveTab] = useState('my-tickets');
  const [messages, setMessages] = useState([
    { id: 1, text: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketStatus, setTicketStatus] = useState({ loading: false, error: '', success: '' });
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        setTicketsLoading(true);
        const response = await authFetch('/api/tickets/my-tickets');
        if (!response.ok) {
          throw new Error('No se pudieron cargar tus tickets.');
        }
        const data = await response.json();
        setMyTickets(data);
      } catch (err: any) {
        setTicketsError(err.message || 'Ocurrió un error inesperado.');
      } finally {
        setTicketsLoading(false);
      }
    };

    fetchMyTickets();
  }, []);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketStatus({ loading: true, error: '', success: '' });

    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      setTicketStatus({ loading: false, error: 'Por favor, completa todos los campos.', success: '' });
      return;
    }

    try {
      const response = await authFetch('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject: ticketSubject, message: ticketMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send ticket');
      }
      
      const newTicket = await response.json();
      setMyTickets(prevTickets => [newTicket, ...prevTickets]);

      setTicketStatus({ loading: false, success: '¡Ticket enviado con éxito! Nuestro equipo se pondrá en contacto contigo pronto.', error: '' });
      setTicketSubject('');
      setTicketMessage('');
    } catch (error: any) {
      setTicketStatus({ loading: false, error: error.message || 'Ocurrió un error al enviar el ticket. Por favor, intenta de nuevo.', success: '' });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isBotThinking) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const currentInput = input;
    setInput('');
    setIsBotThinking(true);

    try {
      const response = await authFetch('/api/support/chat', {
        method: 'POST',
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from bot');
      }

      const data = await response.json();
      const botMessage = { id: Date.now() + 1, text: data.response, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      const errorMessage = { id: Date.now() + 1, text: 'Lo siento, no pude procesar tu solicitud. Por favor, intenta de nuevo.', sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsBotThinking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Centro de Soporte</h1>
        <p className="mt-2 text-lg text-gray-600">Gestiona tus tickets, crea nuevas solicitudes o habla con nuestro asistente virtual para obtener ayuda al instante.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="mb-6">
              <nav className="-mb-px flex space-x-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('my-tickets')}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'my-tickets'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Mis Tickets
                </button>
                <button
                  onClick={() => setActiveTab('create-ticket')}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'create-ticket'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Crear Ticket
                </button>
                <button
                  onClick={() => setActiveTab('chatbot')}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'chatbot'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Asistente Virtual
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div id="tab-content">
              {activeTab === 'my-tickets' && (
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Mis Tickets de Soporte</h2>
                  {ticketsLoading && <div className="text-center py-4">Cargando tickets...</div>}
                  {ticketsError && <p className="text-red-600 bg-red-50 p-4 rounded-md">{ticketsError}</p>}
                  {!ticketsLoading && !ticketsError && <MyTicketsList tickets={myTickets} />}
                </div>
              )}

              {activeTab === 'create-ticket' && (
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Crear Nuevo Ticket</h2>
                  <form onSubmit={handleTicketSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                      <input type="text" id="subject" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3.5" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                      <textarea id="message" value={ticketMessage} onChange={(e) => setTicketMessage(e.target.value)} rows={5} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3.5"></textarea>
                    </div>
                    <button type="submit" disabled={ticketStatus.loading} className="w-full bg-primary text-black rounded-lg px-4 py-3 font-semibold shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition disabled:opacity-50">
                      {ticketStatus.loading ? 'Enviando...' : 'Enviar Ticket'}
                    </button>
                    {ticketStatus.success && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-md mt-2">{ticketStatus.success}</p>}
                    {ticketStatus.error && <p className="text-sm text-red-700 bg-red-50 p-3 rounded-md mt-2">{ticketStatus.error}</p>}
                  </form>
                </div>
              )}

              {activeTab === 'chatbot' && (
                <div className="flex flex-col h-[500px]">
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Asistente Virtual</h2>
                  <div className="flex-grow overflow-y-auto mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    {messages.map(message => (
                      <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                        <div className={`rounded-xl px-4 py-2.5 max-w-xs lg:max-w-md shadow-sm ${message.sender === 'user' ? 'bg-primary text-black' : 'bg-white text-gray-800'}`}>
                          {message.text}
                        </div>
                      </div>
                    ))}
                    {isBotThinking && (
                      <div key="thinking" className="flex justify-start mb-2">
                        <div className="rounded-xl px-4 py-2.5 bg-white text-gray-800 shadow-sm">
                          <div className="flex items-center justify-center space-x-1.5 h-5">
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-grow block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3.5"
                      placeholder="Escribe tu pregunta..."
                      disabled={isBotThinking}
                    />
                    <button type="submit" className="px-5 py-2.5 bg-primary text-black font-semibold rounded-lg shadow-md hover:bg-primary-dark disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" disabled={isBotThinking}>
                      Enviar
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <FAQ />
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
