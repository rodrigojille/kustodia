'use client';

import React, { useState, useEffect } from 'react';
import { authFetch } from '../../utils/authFetch';

interface BlacklistEntry {
  id: number;
  type: 'user_id' | 'wallet_address' | 'email' | 'ip_address';
  identifier: string;
  reason: 'fraud' | 'suspicious_activity' | 'regulatory_compliance' | 'terms_violation' | 'security_breach' | 'other';
  status: 'active' | 'inactive' | 'expired';
  description?: string;
  reference?: string;
  source?: string;
  addedBy?: {
    id: number;
    email: string;
  };
  reviewedBy?: {
    id: number;
    email: string;
  };
  reviewNotes?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface BlacklistStats {
  totalEntries: number;
  activeEntries: number;
  expiredEntries: number;
  entriesByType: Record<string, number>;
  entriesByReason: Record<string, number>;
}

const BlacklistManagement: React.FC = () => {
  const [blacklistEntries, setBlacklistEntries] = useState<BlacklistEntry[]>([]);
  const [stats, setStats] = useState<BlacklistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state for adding new entries
  const [newEntry, setNewEntry] = useState({
    type: 'wallet_address' as const,
    identifier: '',
    reason: 'fraud' as const,
    description: '',
    reference: '',
    source: '',
    expiryDate: ''
  });

  useEffect(() => {
    fetchBlacklistData();
  }, []);

  const fetchBlacklistData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [entriesResponse, statsResponse] = await Promise.all([
        authFetch('/api/blacklist'),
        authFetch('/api/blacklist/stats')
      ]);

      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json();
        setBlacklistEntries(entriesData.data || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('add');
    setError(null);

    try {
      const response = await authFetch('/api/blacklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEntry,
          expiryDate: newEntry.expiryDate || null
        }),
      });

      if (response.ok) {
        await fetchBlacklistData();
        setShowAddForm(false);
        setNewEntry({
          type: 'wallet_address',
          identifier: '',
          reason: 'fraud',
          description: '',
          reference: '',
          source: '',
          expiryDate: ''
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add blacklist entry');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveEntry = async (entryId: number) => {
    if (!confirm('Are you sure you want to remove this blacklist entry?')) {
      return;
    }

    setActionLoading(`remove-${entryId}`);
    setError(null);

    try {
      const response = await authFetch(`/api/blacklist/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchBlacklistData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove blacklist entry');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCleanupExpired = async () => {
    if (!confirm('Are you sure you want to cleanup all expired entries?')) {
      return;
    }

    setActionLoading('cleanup');
    setError(null);

    try {
      const response = await authFetch('/api/blacklist/cleanup', {
        method: 'POST',
      });

      if (response.ok) {
        await fetchBlacklistData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cleanup expired entries');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user_id': return 'bg-blue-100 text-blue-800';
      case 'wallet_address': return 'bg-purple-100 text-purple-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'ip_address': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'fraud': return 'bg-red-100 text-red-800';
      case 'suspicious_activity': return 'bg-orange-100 text-orange-800';
      case 'regulatory_compliance': return 'bg-blue-100 text-blue-800';
      case 'terms_violation': return 'bg-purple-100 text-purple-800';
      case 'security_breach': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter entries based on search and filters
  const filteredEntries = blacklistEntries.filter(entry => {
    const matchesSearch = entry.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || entry.type === filterType;
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">🚫 Gestión de Lista Negra</h3>
          <p className="text-gray-600">Gestiona entradas de lista negra para cumplimiento AML</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {showAddForm ? 'Cancelar' : 'Agregar Entrada'}
          </button>
          <button
            onClick={handleCleanupExpired}
            disabled={actionLoading === 'cleanup'}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
          >
            {actionLoading === 'cleanup' ? 'Limpiando...' : 'Limpiar Expiradas'}
          </button>
          <button
            onClick={fetchBlacklistData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.totalEntries}</div>
            <div className="text-sm text-gray-600">Entradas Totales</div>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">{stats.activeEntries}</div>
            <div className="text-sm text-gray-600">Entradas Activas</div>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.expiredEntries}</div>
            <div className="text-sm text-gray-600">Entradas Expiradas</div>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="text-2xl font-bold text-purple-600">{stats?.entriesByType?.wallet_address || 0}</div>
            <div className="text-sm text-gray-600">Direcciones de Billetera</div>
          </div>
        </div>
      )}

      {/* Add Entry Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Agregar Nueva Entrada a Lista Negra</h4>
          <form onSubmit={handleAddEntry} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={newEntry.type}
                  onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="wallet_address">Dirección de Billetera</option>
                  <option value="email">Correo Electrónico</option>
                  <option value="user_id">ID de Usuario</option>
                  <option value="ip_address">Dirección IP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razón</label>
                <select
                  value={newEntry.reason}
                  onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="fraud">Fraude</option>
                  <option value="suspicious_activity">Actividad Sospechosa</option>
                  <option value="regulatory_compliance">Cumplimiento Regulatorio</option>
                  <option value="terms_violation">Violación de Términos</option>
                  <option value="security_breach">Brecha de Seguridad</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Identificador *</label>
              <input
                type="text"
                value={newEntry.identifier}
                onChange={(e) => setNewEntry({ ...newEntry, identifier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese el identificador a incluir en lista negra"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Descripción opcional de por qué esta entrada está en lista negra"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
                <input
                  type="text"
                  value={newEntry.reference}
                  onChange={(e) => setNewEntry({ ...newEntry, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Referencia de caso/ticket"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuente</label>
                <input
                  type="text"
                  value={newEntry.source}
                  onChange={(e) => setNewEntry({ ...newEntry, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Fuente de la lista negra"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Expiración (Opcional)</label>
                <input
                  type="datetime-local"
                  value={newEntry.expiryDate}
                  onChange={(e) => setNewEntry({ ...newEntry, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={actionLoading === 'add'}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'add' ? 'Agregando...' : 'Agregar Entrada'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Buscar por identificador, descripción o referencia..."
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los Tipos</option>
              <option value="wallet_address">Dirección de Billetera</option>
              <option value="email">Correo Electrónico</option>
              <option value="user_id">ID de Usuario</option>
              <option value="ip_address">Dirección IP</option>
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="expired">Expirado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blacklist Entries Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">
            Entradas de Lista Negra ({filteredEntries.length})
          </h4>
        </div>
        
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
              ? 'No hay entradas que coincidan con sus criterios de búsqueda' 
              : 'No se encontraron entradas en lista negra'
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo e Identificador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Razón y Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agregado Por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}>
                          {entry.type.replace('_', ' ')}
                        </div>
                        <div className="mt-1 text-sm font-mono text-gray-900 break-all">
                          {entry.identifier}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonColor(entry.reason)}`}>
                          {entry.reason.replace('_', ' ')}
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                            {entry.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {entry.description || '-'}
                      </div>
                      {entry.reference && (
                        <div className="text-xs text-gray-500">
                          Ref: {entry.reference}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.addedBy?.email || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(entry.createdAt)}
                      {entry.expiryDate && (
                        <div className="text-xs text-orange-600">
                          Expira: {formatDate(entry.expiryDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleRemoveEntry(entry.id)}
                        disabled={actionLoading === `remove-${entry.id}`}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {actionLoading === `remove-${entry.id}` ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlacklistManagement;
