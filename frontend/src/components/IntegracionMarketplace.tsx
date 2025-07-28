'use client';

import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';
import VehicleNFTForm from './VehicleNFTForm';
import PropertyNFTForm from './PropertyNFTForm';
import FileUpload from './FileUpload';

interface ActivoUsuario {
  tokenId: string;
  tipoActivo: 'vehiculo' | 'propiedad';
  titulo: string;
  descripcion: string;
  listoParaMarketplace: boolean;
  urlVerificacion: string;
}

interface DatosMarketplace {
  tokenId: string;
  contractAddress: string;
  blockchain: string;
  verificationUrl: string;
  history: number;
  lastUpdated: string;
  kustodiaCertified: boolean;
  metadata?: {
    tokenId: string;
    assetId: string;
    assetType: string;
    owner: string;
    tokenURI: string;
    createdAt: string;
    lastUpdated: string;
    metadata: Record<string, any>;
    history: Array<{
      eventType: string;
      timestamp: string;
      authorizedBy: string;
      description: string;
      transactionAmount: string;
      supportingDocs: string[];
    }>;
  };
}

const IntegracionMarketplace: React.FC = () => {
  const [pestanaActiva, setPestanaActiva] = useState<'crear' | 'mis-activos' | 'actualizacion-servicio'>('crear');
  const [tipoCreacion, setTipoCreacion] = useState<'vehiculo' | 'propiedad'>('vehiculo');
  const [activosUsuario, setActivosUsuario] = useState<ActivoUsuario[]>([]);
  const [activoSeleccionado, setActivoSeleccionado] = useState<string | null>(null);
  const [datosMarketplace, setDatosMarketplace] = useState<DatosMarketplace | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Translation function for metadata field names
  const translateFieldName = (fieldName: string): string => {
    const translations: Record<string, string> = {
      'make': 'Marca',
      'model': 'Modelo', 
      'year': 'Año',
      'vin': 'VIN',
      'engineNumber': 'Número de Motor',
      'color': 'Color',
      'fuelType': 'Tipo de Combustible',
      'engineSize': 'Cilindraje',
      'currentMileage': 'Kilometraje Actual',
      'isCommercial': 'Es Comercial',
      'plateNumber': 'Número de Placa',
      'transmission': 'Transmisión',
      'doors': 'Puertas',
      'seats': 'Asientos'
    };
    return translations[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // Translation function for metadata values
  const translateFieldValue = (key: string, value: string): string => {
    if (key === 'isCommercial') {
      return value === 'true' ? 'Sí' : 'No';
    }
    if (key === 'currentMileage') {
      return `${value} km`;
    }
    if (key === 'engineSize') {
      return `${value} cc`;
    }
    return value;
  };

  // Estado del formulario de actualización de servicio
  const [formularioActualizacion, setFormularioActualizacion] = useState({
    tokenId: '',
    tipoActualizacion: 'mantenimiento',
    tipoProveedor: 'agencia',
    detallesServicio: '',
    documentosSoporte: [] as string[]
  });

  const pestanas = [
    { id: 'crear', nombre: 'Crear Gemelo Digital', icono: '🎨' },
    { id: 'mis-activos', nombre: 'Mis Activos', icono: '💎' },
    { id: 'actualizacion-servicio', nombre: 'Actualizaciones de Servicio', icono: '🔧' }
  ];

  useEffect(() => {
    if (pestanaActiva === 'mis-activos' || pestanaActiva === 'actualizacion-servicio') {
      obtenerActivosUsuario();
    }
  }, [pestanaActiva]);

  const obtenerActivosUsuario = async () => {
    try {
      setCargando(true);
      setError(null);
      console.log('Fetching user assets...');
      
      const response = await authFetch('/api/assets/user/assets');
      console.log('User assets response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('User assets response:', data);
        
        if (data.success && Array.isArray(data.assets)) {
          console.log('Setting user assets:', data.assets.length, 'assets found');
          // Transform backend data to match frontend interface
          const transformedAssets = data.assets.map((asset: any) => {
            // Extract meaningful asset name from metadata
            let assetName = `Token #${asset.tokenId}`;
            
            console.log('Processing asset:', asset.tokenId, 'Full asset data:', asset);
            
            // Try multiple metadata paths
            let meta = null;
            if (asset.metadata && asset.metadata.metadata) {
              meta = asset.metadata.metadata;
              console.log('Found metadata.metadata:', meta);
            } else if (asset.metadata) {
              meta = asset.metadata;
              console.log('Found metadata:', meta);
            }
            
            if (meta) {
              // For vehicles: try to build name from make, model, year
              if (meta.make || meta.model || meta.year) {
                const parts = [];
                if (meta.year) parts.push(meta.year);
                if (meta.make) parts.push(meta.make);
                if (meta.model) parts.push(meta.model);
                if (parts.length > 0) {
                  assetName = parts.join(' ');
                  console.log('Built vehicle name:', assetName);
                }
              }
              // For properties: try to use address or title
              else if (meta.address || meta.title || meta.propertyType) {
                const parts = [];
                if (meta.propertyType) parts.push(meta.propertyType);
                if (meta.address) parts.push(meta.address);
                if (meta.title) parts.push(meta.title);
                if (parts.length > 0) {
                  assetName = parts.join(' - ');
                  console.log('Built property name:', assetName);
                }
              }
            } else {
              console.log('No metadata found for asset:', asset.tokenId);
              // Try to extract from asset object directly as fallback
              if (asset.make || asset.model || asset.year) {
                const parts = [];
                if (asset.year) parts.push(asset.year);
                if (asset.make) parts.push(asset.make);
                if (asset.model) parts.push(asset.model);
                if (parts.length > 0) {
                  assetName = parts.join(' ');
                  console.log('Built vehicle name from asset directly:', assetName);
                }
              }
            }
            
            // Determine asset type based on metadata
            let tipoActivo: 'vehiculo' | 'propiedad' = 'propiedad'; // default to property
            
            // Check if it's a vehicle based on metadata
            if (meta && (meta.make || meta.model || meta.year || meta.vin)) {
              tipoActivo = 'vehiculo';
            }
            // Check if it's a vehicle based on direct asset properties
            else if (asset.make || asset.model || asset.year || asset.vin) {
              tipoActivo = 'vehiculo';
            }
            // Check asset type from backend if available
            else if (asset.assetType === 'vehicle') {
              tipoActivo = 'vehiculo';
            }
            
            console.log('Determined asset type for token', asset.tokenId, ':', tipoActivo);
            
            return {
              tokenId: asset.tokenId,
              tipoActivo: tipoActivo,
              titulo: assetName,
              descripcion: `Gemelo Digital en blockchain ${asset.blockchain}`,
              listoParaMarketplace: asset.kustodiaCertified,
              urlVerificacion: asset.verificationUrl
            };
          });
          setActivosUsuario(transformedAssets);
        } else {
          console.error('Invalid assets response structure:', data);
          setActivosUsuario([]);
        }
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData);
        setError(errorData.error || 'Error al cargar tus activos');
      }
    } catch (err) {
      console.error('Error obteniendo activos del usuario:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar tus activos');
    } finally {
      setCargando(false);
    }
  };

  const manejarCreacionParaMarketplace = async (tipoActivo: 'vehiculo' | 'propiedad', datosActivo: any) => {
    try {
      setCargando(true);
      setError(null);

      const response = await authFetch('/api/assets/create-for-marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetType: tipoActivo === 'vehiculo' ? 'vehicle' : 'property',
          assetData: datosActivo,
          intendedMarketplace: 'OpenSea'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el gemelo digital');
      }

      const result = await response.json();
      
      alert(`🎉 ¡Gemelo Digital Creado Exitosamente!\n\nToken ID: ${result.tokenId}\nTransacción: ${result.transactionHash}\n\n¡Tu gemelo digital está listo para publicar en cualquier marketplace!`);
      
      // Actualizar activos del usuario
      if (pestanaActiva === 'mis-activos') {
        obtenerActivosUsuario();
      }

    } catch (err) {
      console.error('Error creando gemelo digital para marketplace:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el gemelo digital');
    } finally {
      setCargando(false);
    }
  };

  const obtenerDatosMarketplace = async (tokenId: string) => {
    try {
      setCargando(true);
      setError(null);
      console.log('Fetching data for token:', tokenId);
      
      // Fetch both marketplace data and asset metadata
      const [marketplaceResponse, metadataResponse] = await Promise.all([
        authFetch(`/api/assets/marketplace-data/${tokenId}`),
        authFetch(`/api/assets/asset/${tokenId}/metadata`)
      ]);
      
      console.log('Marketplace response status:', marketplaceResponse.status);
      console.log('Metadata response status:', metadataResponse.status);
      
      if (marketplaceResponse.ok) {
        const marketplaceData = await marketplaceResponse.json();
        console.log('Marketplace data response:', marketplaceData);
        
        if (marketplaceData.success && marketplaceData.marketplaceData) {
          console.log('Setting marketplace data:', marketplaceData.marketplaceData);
          setDatosMarketplace(marketplaceData.marketplaceData);
          setActivoSeleccionado(tokenId);
        } else {
          console.error('No marketplace data found in response:', marketplaceData);
          setError('No se encontraron datos del marketplace para este activo');
        }
      } else {
        const errorData = await marketplaceResponse.json();
        console.error('Marketplace API error:', errorData);
        setError(errorData.error || 'Error al obtener datos del marketplace');
      }
      
      // Handle metadata response
      if (metadataResponse.ok) {
        const metadataData = await metadataResponse.json();
        console.log('Asset metadata response:', metadataData);
        
        if (metadataData.success && metadataData.metadata) {
          // Store metadata for display
          setDatosMarketplace(prev => {
            if (!prev) return null;
            return {
              ...prev,
              metadata: metadataData.metadata
            };
          });
        }
      } else {
        console.warn('Could not fetch asset metadata:', metadataResponse.status);
      }
      
    } catch (err) {
      console.error('Error fetching asset data:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener datos del activo');
    } finally {
      setCargando(false);
    }
  };

  const manejarActualizacionServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setCargando(true);
      setError(null);

      const response = await authFetch('/api/assets/service-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formularioActualizacion),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el servicio');
      }

      alert('✅ ¡Actualización de servicio registrada exitosamente!');
      
      // Resetear formulario
      setFormularioActualizacion({
        tokenId: '',
        tipoActualizacion: 'mantenimiento',
        tipoProveedor: 'agencia',
        detallesServicio: '',
        documentosSoporte: []
      });

    } catch (err) {
      console.error('Error actualizando servicio:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el servicio');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Gemelo Digital de Activos</h1>
      <p className="text-gray-600 mb-8">Crea gemelos digitales, publica en marketplaces y gestiona registros de activos</p>

      {/* Mostrar errores */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Navegación por pestañas */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {pestanas.map((pestana) => (
              <button
                key={pestana.id}
                onClick={() => setPestanaActiva(pestana.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  pestanaActiva === pestana.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{pestana.icono}</span>
                {pestana.nombre}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Pestaña: Crear Gemelo Digital */}
          {pestanaActiva === 'crear' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">🎨 Crear Gemelo Digital</h2>
              <p className="text-gray-600 mb-6">
                Crea el gemelo digital verificado de tu activo antes de ponerlo a la venta
              </p>

              {/* Selector de tipo de activo */}
              <div className="mb-6">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setTipoCreacion('vehiculo')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      tipoCreacion === 'vehiculo'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🚗 Vehículo
                  </button>
                  <button
                    onClick={() => setTipoCreacion('propiedad')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      tipoCreacion === 'propiedad'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🏠 Propiedad
                  </button>
                </div>
              </div>

              {/* Formularios de creación */}
              <div className="bg-gray-50 p-6 rounded-lg">
                {tipoCreacion === 'vehiculo' ? (
                  <VehicleNFTForm onSuccess={(result) => {
                    alert(`🎉 ¡Gemelo Digital del Vehículo Creado Exitosamente!\n\nToken ID: ${result.tokenId}\nTransacción: ${result.transactionHash}\n\n¡Tu gemelo digital está listo para la venta!`);
                    // Actualizar lista si estamos en la pestaña de activos
                    obtenerActivosUsuario();
                  }} />
                ) : (
                  <PropertyNFTForm onSuccess={(result) => {
                    alert(`🎉 ¡Gemelo Digital de la Propiedad Creado Exitosamente!\n\nToken ID: ${result.tokenId}\nTransacción: ${result.transactionHash}\n\n¡Tu gemelo digital está listo para la venta!`);
                    // Actualizar lista si estamos en la pestaña de activos
                    obtenerActivosUsuario();
                  }} />
                )}
              </div>
            </div>
          )}

          {/* Pestaña: Mis Activos */}
          {pestanaActiva === 'mis-activos' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">💎 Mis Gemelos Digitales</h2>
                {cargando && <div className="text-blue-600">Cargando...</div>}
              </div>

              {activosUsuario.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Aún no tienes gemelos digitales creados</p>
                  <button
                    onClick={() => setPestanaActiva('crear')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Crear Mi Primer Gemelo Digital
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activosUsuario.map((activo) => (
                    <div key={activo.tokenId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">
                          {activo.tipoActivo === 'vehiculo' ? '🚗' : '🏠'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activo.listoParaMarketplace 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activo.listoParaMarketplace ? 'Listo para Venta' : 'En Proceso'}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2">{activo.titulo}</h3>
                      <p className="text-gray-600 text-sm mb-4">{activo.descripcion}</p>
                      
                      <div className="space-y-2">
                        <button
                          onClick={() => obtenerDatosMarketplace(activo.tokenId)}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-sm"
                        >
                          Ver Datos del Gemelo Digital
                        </button>
                        
                        <button
                          onClick={() => window.open(`/public/vehicle/${activo.tokenId}`, '_blank')}
                          className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 text-sm"
                        >
                          Verificar Autenticidad
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Mostrar datos de marketplace si hay un activo seleccionado */}
              {datosMarketplace && activoSeleccionado && (
                <div className="mt-8 bg-blue-50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-blue-900">
                      📋 Datos del Gemelo Digital - Token #{datosMarketplace.tokenId}
                    </h3>
                    <button
                      onClick={() => {
                        setDatosMarketplace(null);
                        setActivoSeleccionado(null);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-blue-900">Dirección del Contrato:</p>
                      <p className="font-mono bg-white p-2 rounded border break-all">
                        {datosMarketplace.contractAddress || 'No disponible'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-blue-900">Blockchain:</p>
                      <p className="font-mono bg-white p-2 rounded border">
                        {datosMarketplace.blockchain || 'No disponible'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-blue-900">URL de Verificación:</p>
                      <p className="font-mono bg-white p-2 rounded border break-all">
                        {datosMarketplace.verificationUrl || 'No disponible'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-blue-900">Certificado Kustodia:</p>
                      <p className={`p-2 rounded border font-medium ${
                        datosMarketplace.kustodiaCertified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {datosMarketplace.kustodiaCertified ? '✅ Verificado' : '❌ No Verificado'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Asset Metadata Section */}
                  {datosMarketplace.metadata && (
                    <div className="mt-6 p-4 bg-white rounded border">
                      <h4 className="font-medium text-blue-900 mb-3">🚗 Detalles del Activo</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Tipo de Activo:</p>
                          <p className="bg-gray-50 p-2 rounded">
                            {datosMarketplace.metadata.assetType === '0' ? 'Vehículo' : 
                             datosMarketplace.metadata.assetType === '1' ? 'Propiedad' : 
                             'Otro'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">ID del Activo:</p>
                          <p className="font-mono text-sm">{datosMarketplace.metadata?.assetId || 'No disponible'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Propietario:</p>
                          <p className="font-mono text-sm break-all">{datosMarketplace.metadata?.owner || 'No disponible'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Fecha de Creación:</p>
                          <p className="text-sm">{datosMarketplace.metadata?.createdAt ? new Date(datosMarketplace.metadata.createdAt).toLocaleDateString('es-ES') : 'No disponible'}</p>
                        </div>
                        
                        {datosMarketplace.metadata.metadata && Object.keys(datosMarketplace.metadata.metadata).length > 0 && (
                          <div className="md:col-span-2">
                            <p className="font-medium text-gray-700 mb-2">Metadatos Específicos:</p>
                            <div className="bg-gray-50 p-3 rounded">
                              {Object.entries(datosMarketplace.metadata.metadata).map(([key, value]) => (
                                <div key={key} className="flex justify-between py-1 border-b border-gray-200 last:border-b-0">
                                  <span className="font-medium">{translateFieldName(key)}:</span>
                                  <span className="text-gray-600">{translateFieldValue(key, String(value))}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {datosMarketplace.metadata.history && datosMarketplace.metadata.history.length > 0 && (
                          <div className="md:col-span-2">
                            <p className="font-medium text-gray-700 mb-2">Historial Reciente:</p>
                            <div className="bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                              {datosMarketplace.metadata.history.slice(0, 3).map((event: any, index: number) => (
                                <div key={index} className="text-xs py-1 border-b border-gray-200 last:border-b-0">
                                  <span className="font-medium">{event.eventType || 'Evento'}:</span>
                                  <span className="ml-2 text-gray-600">{event.description || 'Sin descripción'}</span>
                                  {event.timestamp && (
                                    <span className="ml-2 text-gray-500">
                                      ({new Date(event.timestamp).toLocaleDateString('es-ES')})
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 p-4 bg-white rounded border">
                    <p className="font-medium text-blue-900 mb-2">📋 Instrucciones para Venta:</p>
                    <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                      <li>Copia la dirección del contrato y el Token ID</li>
                      <li>Publica tu activo en cualquier plataforma de venta</li>
                      <li>Incluye estos datos para verificación</li>
                      <li>Comparte la URL de verificación con compradores</li>
                      <li>¡Tu gemelo digital estará listo para vender!</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pestaña: Actualizaciones de Servicio */}
          {pestanaActiva === 'actualizacion-servicio' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">🔧 Actualizaciones de Servicio</h2>
              <p className="text-gray-600 mb-6">
                Agencias, talleres y proveedores de servicios pueden actualizar los registros de los activos
              </p>

              <form onSubmit={manejarActualizacionServicio} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar tu Activo
                    </label>
                    {cargando ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                        Cargando tus activos...
                      </div>
                    ) : activosUsuario.length > 0 ? (
                      <select
                        value={formularioActualizacion.tokenId}
                        onChange={(e) => setFormularioActualizacion({
                          ...formularioActualizacion,
                          tokenId: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecciona un activo</option>
                        {activosUsuario.map((activo) => (
                          <option key={activo.tokenId} value={activo.tokenId}>
                            {activo.titulo} (Token #{activo.tokenId})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                        No tienes activos digitales aún. Crea uno en la pestaña "Crear Gemelo Digital".
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Actualización
                    </label>
                    <select
                      value={formularioActualizacion.tipoActualizacion}
                      onChange={(e) => setFormularioActualizacion({
                        ...formularioActualizacion,
                        tipoActualizacion: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="mantenimiento">🔧 Mantenimiento</option>
                      <option value="avaluo">💰 Avalúo</option>
                      <option value="inspeccion">🔍 Inspección</option>
                      <option value="mejora">⬆️ Mejora/Upgrade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Proveedor
                    </label>
                    <select
                      value={formularioActualizacion.tipoProveedor}
                      onChange={(e) => setFormularioActualizacion({
                        ...formularioActualizacion,
                        tipoProveedor: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="agencia">🏢 Agencia/Concesionario</option>
                      <option value="taller">🔧 Taller Mecánico</option>
                      <option value="avaluador">💰 Avaluador Certificado</option>
                      <option value="inspector">🔍 Inspector Técnico</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-4">
                    💡 <strong>Información adicional:</strong> Agrega detalles específicos sobre el servicio realizado
                  </p>
                  
                  <textarea
                    value={formularioActualizacion.detallesServicio}
                    onChange={(e) => setFormularioActualizacion({
                      ...formularioActualizacion,
                      detallesServicio: e.target.value
                    })}
                    placeholder="Ej: Cambio de aceite y filtros, kilometraje actual: 45,000 km, próximo servicio: 50,000 km"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                </div>

                {/* File Upload Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">📎 Documentos de Soporte</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sube fotos, facturas, reportes o cualquier documento que respalde el servicio realizado
                  </p>
                  <FileUpload
                    onFilesSelected={(files) => {
                      const fileUrls = files.map(file => URL.createObjectURL(file));
                      setFormularioActualizacion({
                        ...formularioActualizacion,
                        documentosSoporte: fileUrls
                      });
                    }}
                    acceptedTypes="image/*,.pdf,.doc,.docx"
                    maxFiles={10}
                    maxSizePerFile={10}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={cargando}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cargando ? 'Actualizando...' : 'Registrar Actualización'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      

    </div>
  );
};

export default IntegracionMarketplace;
