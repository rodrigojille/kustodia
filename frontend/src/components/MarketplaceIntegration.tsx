'use client';

import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';
import VehicleNFTForm from './VehicleNFTForm';
import PropertyNFTForm from './PropertyNFTForm';
import FileUpload from './FileUpload';
import ipfsService, { IPFSUploadResult } from '../services/ipfsService';

interface ActivoUsuario {
  tokenId: string;
  contractAddress: string;
  blockchain: string;
  verificationUrl: string;
  kustodiaCertified: boolean;
  lastUpdated: string;
  // Optional fields that might be added later
  titulo?: string;
  descripcion?: string;
  tipoActivo?: 'vehiculo' | 'propiedad';
}

interface DatosMarketplace {
  tokenId: string;
  direccionContrato: string;
  blockchain: string;
  urlVerificacion: string;
  historial: number;
  ultimaActualizacion: string;
  certificadoKustodia: boolean;
}

const IntegracionMarketplace: React.FC = () => {
  const [pestanaActiva, setPestanaActiva] = useState<'crear' | 'mis-activos' | 'actualizacion-servicio'>('crear');
  const [tipoCreacion, setTipoCreacion] = useState<'vehiculo' | 'propiedad'>('vehiculo');
  const [activosUsuario, setActivosUsuario] = useState<ActivoUsuario[]>([]);
  const [activoSeleccionado, setActivoSeleccionado] = useState<string | null>(null);
  const [datosMarketplace, setDatosMarketplace] = useState<DatosMarketplace | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario de actualización de servicio
  const [formularioActualizacion, setFormularioActualizacion] = useState({
    tokenId: '',
    tipoActualizacion: 'mantenimiento',
    tipoProveedor: 'agencia',
    datosActualizacion: {},
    documentosSoporte: [] as IPFSUploadResult[],
    descripcionActualizacion: ''
  });
  
  // Estado para archivos seleccionados (antes de subir)
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([]);
  const [subiendoArchivos, setSubiendoArchivos] = useState(false);

  useEffect(() => {
    if (pestanaActiva === 'mis-activos') {
      obtenerActivosUsuario();
    }
  }, [pestanaActiva]);

  const generateMarketplaceData = async (tokenId: string) => {
    try {
      setCargando(true);
      setError(null);
      console.log('Generating marketplace data for token:', tokenId);
      
      const response = await authFetch(`/api/assets/marketplace-data/${tokenId}`);
      console.log('Marketplace data response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Marketplace data received:', data);
        
        if (data.success && data.marketplaceData) {
          console.log('Raw marketplace data received:', data.marketplaceData);
          console.log('Setting datosMarketplace to:', data.marketplaceData);
          console.log('Data properties:', Object.keys(data.marketplaceData));
          console.log('direccionContrato:', data.marketplaceData.direccionContrato);
          console.log('tokenId:', data.marketplaceData.tokenId);
          
          setDatosMarketplace(data.marketplaceData);
          setActivoSeleccionado(tokenId);
          
          // Force a re-render by logging after state update
          setTimeout(() => {
            console.log('State after update - datosMarketplace:', data.marketplaceData);
          }, 100);
        } else {
          console.error('Invalid marketplace data response:', data);
          setError('Invalid marketplace data received');
        }
      } else {
        const errorData = await response.json();
        console.error('Marketplace data API error:', errorData);
        setError(errorData.error || 'Failed to fetch marketplace data');
      }
    } catch (err) {
      console.error('Error generating marketplace data:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate marketplace data');
    } finally {
      setCargando(false);
    }
  };

  // Handle NFT creation success from child forms
  const manejarCreacionParaMarketplace = async (assetType: string, result: any) => {
    try {
      setCargando(true);
      setError(null);

      const response = await authFetch('/api/assets/create-for-marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetType,
          assetData: result,
          intendedMarketplace: 'opensea'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create NFT for marketplace');
      }

      const data = await response.json();
      
      // Show success message
      alert(`NFT creado exitosamente! Token ID: ${data.tokenId}`);
      
      // Refresh user assets
      obtenerActivosUsuario();
      
    } catch (err) {
      console.error('Error creating NFT for marketplace:', err);
      setError(err instanceof Error ? err.message : 'Failed to create NFT');
    } finally {
      setCargando(false);
    }
  };

  // Fetch user's NFT assets
  const obtenerActivosUsuario = async () => {
    try {
      setCargando(true);
      setError(null);
      console.log('Fetching user assets...');

      const response = await authFetch('/api/assets/user/assets');
      console.log('User assets response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('User assets API error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch user assets');
      }

      const data = await response.json();
      console.log('Assets API response:', data);
      console.log('Assets array:', data.assets);
      console.log('Assets count:', data.assets?.length || 0);
      
      if (data.success && Array.isArray(data.assets)) {
        setActivosUsuario(data.assets);
        console.log('User assets set successfully, count:', data.assets.length);
      } else {
        console.error('Invalid assets response structure:', data);
        setActivosUsuario([]);
      }
      
    } catch (err) {
      console.error('Error fetching user assets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch assets');
      setActivosUsuario([]);
    } finally {
      setCargando(false);
    }
  };

  // Utility function to copy text to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copiado al portapapeles!');
    } catch (err) {
      console.error('Failed to copy text:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Copiado al portapapeles!');
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        alert('Error al copiar al portapapeles');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleServiceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setCargando(true);
      setError(null);

      const response = await authFetch(`/api/assets/update/${formularioActualizacion.tokenId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updateType: formularioActualizacion.tipoActualizacion,
          providerType: formularioActualizacion.tipoProveedor,
          updateData: {
            description: formularioActualizacion.descripcionActualizacion,
            ...formularioActualizacion.datosActualizacion
          },
          supportingDocs: formularioActualizacion.documentosSoporte
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update asset');
      }

      const result = await response.json();
      
      alert(`✅ Asset Updated!\n\nTransaction: ${result.transactionHash}\n\nThe asset record has been updated on the blockchain.`);
      
      // Reset form
      setFormularioActualizacion({
        tokenId: '',
        tipoActualizacion: 'mantenimiento',
        tipoProveedor: 'agencia',
        datosActualizacion: {},
        documentosSoporte: [] as IPFSUploadResult[],
        descripcionActualizacion: ''
      });
      setArchivosSeleccionados([]);

    } catch (err) {
      console.error('Error updating asset:', err);
      setError(err instanceof Error ? err.message : 'Failed to update asset');
    } finally {
      setCargando(false);
    }
  };

  // Load user assets when switching to 'mis-activos' tab
  useEffect(() => {
    if (pestanaActiva === 'mis-activos') {
      obtenerActivosUsuario();
    }
  }, [pestanaActiva]);

  // Handle file uploads to IPFS
  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    try {
      setSubiendoArchivos(true);
      setError(null);
      
      // Upload files to IPFS
      const uploadResults = await ipfsService.smartUpload(files, {
        name: `asset_${formularioActualizacion.tokenId}_docs`,
        keyvalues: {
          tokenId: formularioActualizacion.tokenId,
          updateType: formularioActualizacion.tipoActualizacion,
          providerType: formularioActualizacion.tipoProveedor,
          timestamp: new Date().toISOString()
        }
      });
      
      // Update form state with uploaded file results
      setFormularioActualizacion(prev => ({
        ...prev,
        documentosSoporte: [...prev.documentosSoporte, ...uploadResults]
      }));
      
      alert(`${uploadResults.length} archivo(s) subido(s) exitosamente a IPFS!`);
      
    } catch (error) {
      console.error('Error uploading files:', error);
      setError(error instanceof Error ? error.message : 'Error al subir archivos');
    } finally {
      setSubiendoArchivos(false);
    }
  };

  const tabs = [
    { id: 'crear', label: 'Crear Gemelo Digital' },
    { id: 'mis-activos', label: 'Mis Activos' },
    { id: 'actualizacion-servicio', label: 'Actualización de Servicio' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Marketplace Integration</h1>

      {/* Navegación por pestañas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPestanaActiva(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                pestanaActiva === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Create NFT Tab */}
      {pestanaActiva === 'crear' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Create NFT Before Listing</h3>
            <p className="text-blue-700">
              Create your asset NFT through Kustodia first, then list it on any marketplace like OpenSea, 
              Rarible, or local marketplaces. Your NFT will have verified provenance and history.
            </p>
          </div>

          {/* Asset Type Selection */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setTipoCreacion('vehiculo')}
              className={`px-6 py-3 rounded-lg font-medium ${
                tipoCreacion === 'vehiculo'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🚗 Vehicle NFT
            </button>
            <button
              onClick={() => setTipoCreacion('propiedad')}
              className={`px-6 py-3 rounded-lg font-medium ${
                tipoCreacion === 'propiedad'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🏠 Property NFT
            </button>
          </div>

          {/* NFT Creation Forms */}
          {tipoCreacion === 'vehiculo' && (
            <VehicleNFTForm 
              onSuccess={(result) => manejarCreacionParaMarketplace('vehiculo', result)}
            />
          )}

          {tipoCreacion === 'propiedad' && (
            <PropertyNFTForm 
              onSuccess={(result) => manejarCreacionParaMarketplace('propiedad', result)}
            />
          )}
        </div>
      )}

      {/* My Assets Tab */}
      {pestanaActiva === 'mis-activos' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Tus Activos NFT</h2>
            <button
              onClick={obtenerActivosUsuario}
              disabled={cargando}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {cargando ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>

          {activosUsuario.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">Aún no tienes activos NFT.</p>
              <button
                onClick={() => setPestanaActiva('crear')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First NFT
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activosUsuario.map((asset) => (
                <div key={asset.tokenId} className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-800">
                      {asset.titulo || `NFT Token #${asset.tokenId}`}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      asset.kustodiaCertified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {asset.kustodiaCertified ? 'Certificado' : 'Pendiente'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      {asset.descripcion || `Gemelo Digital en blockchain ${asset.blockchain}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Contrato: {asset.contractAddress.slice(0, 10)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      Actualizado: {new Date(asset.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      Token ID: {asset.tokenId}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => generateMarketplaceData(asset.tokenId)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Datos Marketplace
                      </button>
                      
                      <button
                        onClick={() => window.open(asset.verificationUrl, '_blank')}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Verificar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Marketplace Data Modal */}
          {datosMarketplace && activoSeleccionado && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
                {/* Debug: Log modal data */}
                {(() => {
                  console.log('MODAL RENDERING - datosMarketplace:', datosMarketplace);
                  console.log('MODAL RENDERING - activoSeleccionado:', activoSeleccionado);
                  console.log('MODAL RENDERING - datosMarketplace.direccionContrato:', datosMarketplace?.direccionContrato);
                  return null;
                })()}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Datos del Gemelo Digital - Token #{datosMarketplace?.tokenId || 'N/A'}</h3>
                  <button
                    onClick={() => {
                      setDatosMarketplace(null);
                      setActivoSeleccionado(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dirección del Contrato</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-gray-100 rounded text-sm">
                        {datosMarketplace.direccionContrato || 'No disponible'}
                      </code>
                      <button
                        onClick={() => copyToClipboard(datosMarketplace.direccionContrato || '')}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Token ID</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-gray-100 rounded text-sm">
                        {datosMarketplace.tokenId || 'No disponible'}
                      </code>
                      <button
                        onClick={() => copyToClipboard(datosMarketplace.tokenId || '')}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Blockchain</label>
                      <p className="p-2 bg-gray-100 rounded text-sm">{datosMarketplace.blockchain || 'No disponible'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Eventos de Historial</label>
                      <p className="p-2 bg-gray-100 rounded text-sm">{datosMarketplace.historial || 0}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL de Verificación</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-gray-100 rounded text-sm break-all">
                        {datosMarketplace.urlVerificacion || 'No disponible'}
                      </code>
                      <button
                        onClick={() => copyToClipboard(datosMarketplace.urlVerificacion || '')}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Certificado Kustodia:</span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      datosMarketplace.certificadoKustodia 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {datosMarketplace.certificadoKustodia ? 'Verificado' : 'No Verificado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Service Update Tab */}
      {pestanaActiva === 'actualizacion-servicio' && (
        <div className="max-w-2xl">
          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Service Provider Updates</h3>
            <p className="text-yellow-700">
              Dealerships, contractors, and appraisers can update NFT records with maintenance, 
              upgrades, inspections, and appraisals.
            </p>
          </div>

          <form onSubmit={handleServiceUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token ID *
              </label>
              <input
                type="text"
                value={formularioActualizacion.tokenId}
                onChange={(e) => setFormularioActualizacion(prev => ({ ...prev, tokenId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter NFT Token ID"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Type *
                </label>
                <select
                  value={formularioActualizacion.tipoActualizacion}
                  onChange={(e) => setFormularioActualizacion(prev => ({ ...prev, tipoActualizacion: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="evaluacion">Evaluación</option>
                  <option value="mejora">Mejora</option>
                  <option value="inspeccion">Inspección</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Type *
                </label>
                <select
                  value={formularioActualizacion.tipoProveedor}
                  onChange={(e) => setFormularioActualizacion(prev => ({ ...prev, tipoProveedor: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="agencia">Agencia</option>
                  <option value="contratista">Contratista</option>
                  <option value="evaluador">Evaluador</option>
                  <option value="propietario">Propietario</option>
                </select>
              </div>
            </div>

            {/* Dynamic fields based on update type */}
            {formularioActualizacion.tipoActualizacion === 'mantenimiento' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Mileage (km) *
                    </label>
                    <input
                      type="number"
                      onChange={(e) => setFormularioActualizacion(prev => ({ 
                        ...prev, 
                        datosActualizacion: { ...prev.datosActualizacion, newMileage: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Location *
                    </label>
                    <input
                      type="text"
                      onChange={(e) => setFormularioActualizacion(prev => ({ 
                        ...prev, 
                        datosActualizacion: { ...prev.datosActualizacion, serviceLocation: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Description
                  </label>
                  <textarea
                    onChange={(e) => setFormularioActualizacion(prev => ({ 
                      ...prev, 
                      datosActualizacion: { ...prev.datosActualizacion, description: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {formularioActualizacion.tipoActualizacion === 'evaluacion' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Appraisal Value (ETH) *
                    </label>
                    <input
                      type="text"
                      onChange={(e) => setFormularioActualizacion(prev => ({ 
                        ...prev, 
                        datosActualizacion: { ...prev.datosActualizacion, appraisalValue: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Appraiser Name *
                    </label>
                    <input
                      type="text"
                      onChange={(e) => setFormularioActualizacion(prev => ({ 
                        ...prev, 
                        datosActualizacion: { ...prev.datosActualizacion, appraiserName: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* General Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción de la Actualización
              </label>
              <textarea
                value={formularioActualizacion.descripcionActualizacion}
                onChange={(e) => setFormularioActualizacion(prev => ({ 
                  ...prev, 
                  descripcionActualizacion: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe los cambios, mantenimiento o mejoras realizadas..."
              />
            </div>

            {/* File Upload Section */}
            <div>
              <FileUpload
                onFilesSelected={setArchivosSeleccionados}
                acceptedTypes="image/*,.pdf,.doc,.docx"
                maxFiles={10}
                maxSizePerFile={10}
                label="Documentos de Soporte"
                description="Sube fotos, facturas, certificados o documentos relacionados"
              />
              
              {archivosSeleccionados.length > 0 && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleFileUpload(archivosSeleccionados)}
                    disabled={subiendoArchivos || archivosSeleccionados.length === 0}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      subiendoArchivos 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {subiendoArchivos ? 'Subiendo a IPFS...' : `Subir ${archivosSeleccionados.length} archivo(s) a IPFS`}
                  </button>
                </div>
              )}
              
              {/* Show uploaded files */}
              {formularioActualizacion.documentosSoporte.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Archivos subidos ({formularioActualizacion.documentosSoporte.length})
                  </h4>
                  <div className="space-y-2">
                    {formularioActualizacion.documentosSoporte.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <div className="flex items-center space-x-2">
                          <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">{file.filename}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => window.open(file.url, '_blank')}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormularioActualizacion(prev => ({
                                ...prev,
                                documentosSoporte: prev.documentosSoporte.filter((_, i) => i !== index)
                              }));
                            }}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={cargando}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                cargando
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {cargando ? 'Actualizando...' : 'Actualizar Registro del Activo'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default IntegracionMarketplace;
