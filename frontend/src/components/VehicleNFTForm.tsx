'use client';

import React, { useState } from 'react';
import { authFetch } from '../utils/authFetch';
import FileUpload from './FileUpload';

interface VehicleFormData {
  vin: string;
  make: string;
  model: string;
  year: string;
  engineNumber: string;
  color: string;
  fuelType: string;
  engineSize: string;
  currentMileage: string;
  isCommercial: boolean;
  plateNumber: string;
}

interface VehicleNFTFormProps {
  onSuccess?: (result: { tokenId: string; transactionHash: string }) => void;
  onCancel?: () => void;
}

const VehicleNFTForm: React.FC<VehicleNFTFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<VehicleFormData>({
    vin: '',
    make: '',
    model: '',
    year: '',
    engineNumber: '',
    color: '',
    fuelType: 'Gasoline',
    engineSize: '',
    currentMileage: '',
    isCommercial: false,
    plateNumber: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.vin || !formData.make || !formData.model || !formData.year) {
        throw new Error('Please fill in all required fields: VIN, Make, Model, and Year');
      }

      const response = await authFetch('/api/assets/vehicle', {
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
        throw new Error(errorData.error || errorData.details || 'Failed to create vehicle NFT');
      }

      const result = await response.json();
      console.log('Vehicle NFT created successfully:', result);

      if (onSuccess) {
        onSuccess(result);
      }

    } catch (err) {
      console.error('Error creating vehicle NFT:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Crear Gemelo Digital del Vehículo</h2>
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
        {/* VIN - Required */}
        <div>
          <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
            VIN (Número de Identificación Vehicular) *
          </label>
          <input
            type="text"
            id="vin"
            name="vin"
            value={formData.vin}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingresa el VIN de 17 caracteres"
            maxLength={17}
            required
          />
        </div>

        {/* Make - Required */}
        <div>
          <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
            Marca *
          </label>
          <input
            type="text"
            id="make"
            name="make"
            value={formData.make}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej., Toyota, Honda, Ford, Nissan"
            required
          />
        </div>

        {/* Model - Required */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Modelo *
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej., Camry, Civic, Sentra, Tsuru"
            required
          />
        </div>

        {/* Year - Required */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Año *
          </label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej., 2020"
            min="1900"
            max={new Date().getFullYear() + 1}
            required
          />
        </div>

        {/* Engine Number */}
        <div>
          <label htmlFor="engineNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Número de Motor
          </label>
          <input
            type="text"
            id="engineNumber"
            name="engineNumber"
            value={formData.engineNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Número de identificación del motor"
          />
        </div>

        {/* Color */}
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej., Rojo, Azul, Blanco, Negro"
          />
        </div>

        {/* Fuel Type */}
        <div>
          <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Combustible
          </label>
          <select
            id="fuelType"
            name="fuelType"
            value={formData.fuelType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Gasoline">Gasolina</option>
            <option value="Diesel">Diésel</option>
            <option value="Electric">Eléctrico</option>
            <option value="Hybrid">Híbrido</option>
            <option value="CNG">GNC (Gas Natural Comprimido)</option>
            <option value="LPG">GLP (Gas Licuado de Petróleo)</option>
          </select>
        </div>

        {/* Engine Size */}
        <div>
          <label htmlFor="engineSize" className="block text-sm font-medium text-gray-700 mb-1">
            Cilindraje (cc)
          </label>
          <input
            type="number"
            id="engineSize"
            name="engineSize"
            value={formData.engineSize}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej., 2000"
            min="0"
          />
        </div>

        {/* Current Mileage */}
        <div>
          <label htmlFor="currentMileage" className="block text-sm font-medium text-gray-700 mb-1">
            Kilometraje Actual (km)
          </label>
          <input
            type="number"
            id="currentMileage"
            name="currentMileage"
            value={formData.currentMileage}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej., 50000"
            min="0"
          />
        </div>

        {/* Plate Number */}
        <div>
          <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Número de Placas
          </label>
          <input
            type="text"
            id="plateNumber"
            name="plateNumber"
            value={formData.plateNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej., ABC-123-4"
          />
        </div>

        {/* Commercial Vehicle Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isCommercial"
            name="isCommercial"
            checked={formData.isCommercial}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isCommercial" className="ml-2 block text-sm text-gray-700">
            Vehículo Comercial
          </label>
        </div>

        {/* File Upload Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📎 Documentos de Soporte</h3>
          <p className="text-sm text-gray-600 mb-4">
            Sube documentos como tarjeta de circulación, factura, fotos del vehículo, etc.
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
            {loading ? 'Creando Gemelo Digital...' : 'Crear Gemelo Digital del Vehículo'}
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
        <h3 className="text-sm font-medium text-blue-800 mb-2">Acerca del Gemelo Digital Vehicular</h3>
        <p className="text-sm text-blue-700">
          Crear un Gemelo Digital generará un token único en blockchain que representa la 
          propiedad e historial de tu vehículo. Este gemelo digital servirá como prueba inmutable 
          de propiedad y puede rastrear mantenimientos, inspecciones y transferencias durante 
          toda la vida útil del vehículo.
        </p>
      </div>
    </div>
  );
};

export default VehicleNFTForm;
