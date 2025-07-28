'use client';

import React, { useState } from 'react';
import { authFetch } from '../utils/authFetch';
import FileUpload from './FileUpload';

interface PropertyFormData {
  cadastralId: string;
  fullAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  propertyType: string;
  squareMeters: string;
  builtArea: string;
  bedrooms: string;
  bathrooms: string;
  parkingSpaces: string;
  yearBuilt: string;
  legalDescription: string;
}

interface PropertyNFTFormProps {
  onSuccess?: (result: { tokenId: string; transactionHash: string }) => void;
  onCancel?: () => void;
}

const PropertyNFTForm: React.FC<PropertyNFTFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    cadastralId: '',
    fullAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Mexico',
    propertyType: '0', // RESIDENTIAL_HOUSE
    squareMeters: '',
    builtArea: '',
    bedrooms: '',
    bathrooms: '',
    parkingSpaces: '',
    yearBuilt: '',
    legalDescription: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const propertyTypes = [
    { value: '0', label: 'Casa Residencial' },
    { value: '1', label: 'Condominio Residencial' },
    { value: '2', label: 'Oficina Comercial' },
    { value: '3', label: 'Local Comercial' },
    { value: '4', label: 'Bodega Comercial' },
    { value: '5', label: 'Terreno Residencial' },
    { value: '6', label: 'Terreno Comercial' },
    { value: '7', label: 'Terreno Agrícola' },
    { value: '8', label: 'Uso Mixto' },
    { value: '9', label: 'Otro' }
  ];

  const mexicanStates = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
    'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
    'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
    'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
    'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.cadastralId || !formData.fullAddress || !formData.city || !formData.state || !formData.squareMeters) {
        throw new Error('Por favor completa todos los campos requeridos: ID Catastral, Dirección, Ciudad, Estado y Metros Cuadrados');
      }

      const response = await authFetch('/api/assets/property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          supportingDocuments: uploadedFiles
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to create property NFT');
      }

      const result = await response.json();
      console.log('Property NFT created successfully:', result);

      if (onSuccess) {
        onSuccess(result);
      }

    } catch (err) {
      console.error('Error creating property NFT:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Crear Gemelo Digital de Propiedad</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cadastral ID - Required */}
        <div>
          <label htmlFor="cadastralId" className="block text-sm font-medium text-gray-700 mb-1">
            Cadastral ID (Registro Público de la Propiedad) *
          </label>
          <input
            type="text"
            id="cadastralId"
            name="cadastralId"
            value={formData.cadastralId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter cadastral/registry ID"
            required
          />
        </div>

        {/* Full Address - Required */}
        <div>
          <label htmlFor="fullAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Dirección Completa *
          </label>
          <input
            type="text"
            id="fullAddress"
            name="fullAddress"
            value={formData.fullAddress}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Calle, número, colonia"
            required
          />
        </div>

        {/* City - Required */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre de la ciudad"
            required
          />
        </div>

        {/* State - Required */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            Estado *
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecciona un estado</option>
            {mexicanStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* Postal Code */}
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
            Código Postal
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 01000"
            maxLength={5}
          />
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            País
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="México"
          />
        </div>

        {/* Property Type */}
        <div>
          <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Propiedad
          </label>
          <select
            id="propertyType"
            name="propertyType"
            value={formData.propertyType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {propertyTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Square Meters - Required */}
        <div>
          <label htmlFor="squareMeters" className="block text-sm font-medium text-gray-700 mb-1">
            Área Total (Metros Cuadrados) *
          </label>
          <input
            type="number"
            id="squareMeters"
            name="squareMeters"
            value={formData.squareMeters}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej., 120"
            min="1"
            required
          />
        </div>

        {/* Built Area */}
        <div>
          <label htmlFor="builtArea" className="block text-sm font-medium text-gray-700 mb-1">
            Área Construida (Metros Cuadrados)
          </label>
          <input
            type="number"
            id="builtArea"
            name="builtArea"
            value={formData.builtArea}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej., 100"
            min="0"
          />
        </div>

        {/* Bedrooms */}
        <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
            Recámaras
          </label>
          <input
            type="number"
            id="bedrooms"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej., 3"
            min="0"
          />
        </div>

        {/* Bathrooms */}
        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
            Baños
          </label>
          <input
            type="number"
            id="bathrooms"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej., 2"
            min="0"
            step="0.5"
          />
        </div>

        {/* Parking Spaces */}
        <div>
          <label htmlFor="parkingSpaces" className="block text-sm font-medium text-gray-700 mb-1">
            Espacios de Estacionamiento
          </label>
          <input
            type="number"
            id="parkingSpaces"
            name="parkingSpaces"
            value={formData.parkingSpaces}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej., 2"
            min="0"
          />
        </div>

        {/* Year Built */}
        <div>
          <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700 mb-1">
            Año de Construcción
          </label>
          <input
            type="number"
            id="yearBuilt"
            name="yearBuilt"
            value={formData.yearBuilt}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej., 2010"
            min="1800"
            max={new Date().getFullYear()}
          />
        </div>

        {/* Legal Description */}
        <div>
          <label htmlFor="legalDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción Legal
          </label>
          <textarea
            id="legalDescription"
            name="legalDescription"
            value={formData.legalDescription}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción legal de la propiedad, límites, etc."
          />
        </div>

        {/* File Upload Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📎 Documentos de Soporte</h3>
          <p className="text-sm text-gray-600 mb-4">
            Sube documentos como escrituras, planos, fotos de la propiedad, etc.
          </p>
          <FileUpload
            onFilesSelected={(files) => {
              // Convert File objects to URLs or handle upload
              const fileUrls = files.map(file => URL.createObjectURL(file));
              setUploadedFiles(fileUrls);
            }}
            acceptedTypes="image/*,.pdf,.doc,.docx"
            maxFiles={10}
            maxSizePerFile={10}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {loading ? 'Creando Gemelo Digital...' : 'Crear Gemelo Digital de Propiedad'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Acerca del Gemelo Digital de Propiedades</h3>
        <p className="text-sm text-blue-700">
          Crear un Gemelo Digital de Propiedad generará un token único en blockchain que representa 
          tu propiedad inmobiliaria y su historial. Este gemelo digital sirve como prueba inmutable 
          de propiedad y puede rastrear avalúos, gravámenes, transferencias y otros eventos importantes 
          durante toda la vida de la propiedad.
        </p>
      </div>
    </div>
  );
};

export default PropertyNFTForm;
