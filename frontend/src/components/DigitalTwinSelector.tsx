import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';

interface VehicleNFT {
  tokenId: string;
  metadata: {
    make: string;
    model: string;
    year: string;
    vin: string;
    currentMileage: string;
    color: string;
    plateNumber?: string;
  };
  ownerAddress: string;
  createdAt: string;
}

interface DigitalTwinSelectorProps {
  onVehicleSelect: (vehicle: VehicleNFT | null) => void;
  selectedVehicle: VehicleNFT | null;
  userAddress?: string;
  className?: string;
}

export const DigitalTwinSelector: React.FC<DigitalTwinSelectorProps> = ({
  onVehicleSelect,
  selectedVehicle,
  userAddress,
  className = ""
}) => {
  const [vehicles, setVehicles] = useState<VehicleNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (userAddress) {
      loadUserVehicles();
    }
  }, [userAddress]);

  const loadUserVehicles = async () => {
    if (!userAddress) {
      console.log('DigitalTwinSelector: No user address provided');
      return;
    }
    
    console.log('[DigitalTwinSelector] Making API call to:', `/api/assets/user-vehicles?address=${userAddress}`);
    setLoading(true);
    setError(null);
    
    try {
      const response = await authFetch(`/api/assets/user-vehicles?address=${userAddress}`);
      console.log('DigitalTwinSelector: API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[DigitalTwinSelector] Received vehicles data:', data);
        console.log('[DigitalTwinSelector] Vehicles array:', data.vehicles);
        console.log('[DigitalTwinSelector] Vehicles count:', data.count);
        setVehicles(data.vehicles || []);
      } else {
        const errorData = await response.json();
        console.error('DigitalTwinSelector: API error:', errorData);
        setError(errorData.error || 'Error loading vehicles');
      }
    } catch (error) {
      console.error('DigitalTwinSelector: Network error:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = (vehicle: VehicleNFT | null) => {
    onVehicleSelect(vehicle);
    setShowDropdown(false);
  };

  const formatVehicleDisplay = (vehicle: VehicleNFT) => {
    const { make, model, year, plateNumber, vin } = vehicle.metadata;
    const plate = plateNumber ? ` • ${plateNumber}` : '';
    const shortVin = vin ? ` • ${vin.slice(-6)}` : '';
    return `${year} ${make} ${model}${plate}${shortVin}`;
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block font-medium text-gray-700 mb-2">
        🚗 Gemelo Digital del Vehículo
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className={`w-full p-3 text-left border-2 rounded-lg focus:outline-none transition-colors ${
            selectedVehicle 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-blue-400'
          }`}
          disabled={loading}
        >
          {loading ? (
            <span className="text-gray-500">🔄 Cargando vehículos...</span>
          ) : selectedVehicle ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-green-800">
                  ✅ {formatVehicleDisplay(selectedVehicle)}
                </span>
                <p className="text-sm text-green-600 mt-1">
                  NFT #{selectedVehicle.tokenId} • Historial verificado en blockchain
                </p>
              </div>
              <span className="text-green-600">🔗</span>
            </div>
          ) : !userAddress ? (
            <span className="text-gray-500">
              ⚠️ Conecta tu wallet para ver vehículos
            </span>
          ) : vehicles.length > 0 ? (
            <span className="text-gray-700">
              📋 Seleccionar vehículo registrado ({vehicles.length} disponible{vehicles.length !== 1 ? 's' : ''})
            </span>
          ) : (
            <span className="text-gray-500">
              ❌ No tienes vehículos registrados
            </span>
          )}
          
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {showDropdown ? '▲' : '▼'}
          </span>
        </button>

        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {!userAddress ? (
              <div className="p-4 text-center">
                <p className="text-gray-500 mb-2">⚠️ Conecta tu wallet para ver vehículos</p>
                <p className="text-xs text-gray-400">Necesitas una dirección de wallet para acceder a tus NFTs</p>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-gray-500 mb-2">❌ No tienes vehículos registrados</p>
                <button
                  type="button"
                  onClick={() => window.open('/nft-demo', '_blank')}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  ➕ Registrar mi primer vehículo
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleVehicleSelect(null)}
                  className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-200"
                >
                  <span className="text-gray-600">❌ No vincular vehículo registrado</span>
                  <p className="text-sm text-gray-500 mt-1">
                    Capturar datos manualmente (sin historial blockchain)
                  </p>
                </button>
                
                {vehicles.map((vehicle) => (
                  <button
                    key={vehicle.tokenId}
                    type="button"
                    onClick={() => handleVehicleSelect(vehicle)}
                    className="w-full p-3 text-left hover:bg-blue-50 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {formatVehicleDisplay(vehicle)}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          NFT #{vehicle.tokenId} • {vehicle.metadata.currentMileage} km
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          ✅ Historial completo en blockchain
                        </p>
                      </div>
                      <span className="text-blue-600">🔗</span>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {selectedVehicle && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">
            🔗 Vehículo Vinculado al Gemelo Digital
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">VIN:</span>
              <span className="font-mono ml-2">{selectedVehicle.metadata.vin}</span>
            </div>
            <div>
              <span className="text-gray-600">Color:</span>
              <span className="ml-2">{selectedVehicle.metadata.color}</span>
            </div>
            <div>
              <span className="text-gray-600">Kilometraje:</span>
              <span className="ml-2">{selectedVehicle.metadata.currentMileage} km</span>
            </div>
            <div>
              <span className="text-gray-600">NFT ID:</span>
              <span className="font-mono ml-2">#{selectedVehicle.tokenId}</span>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            ✅ Este vehículo tiene historial completo y verificado en blockchain
          </p>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm mt-2">
          ⚠️ {error}
        </p>
      )}

      <p className="text-sm text-gray-500 mt-2">
        💡 <strong>¿Qué es un Gemelo Digital?</strong> Es la versión blockchain de tu vehículo con historial completo, 
        mantenimientos, accidentes y transferencias. Aumenta la confianza del comprador y el valor de reventa.
      </p>
    </div>
  );
};
