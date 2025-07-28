"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function KYCUploadPage() {
  const searchParams = useSearchParams();
  const validationId = searchParams.get('validation_id');
  const accountId = searchParams.get('account_id');
  
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [reverseFile, setReverseFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [frontUrl, setFrontUrl] = useState<string>('');
  const [reverseUrl, setReverseUrl] = useState<string>('');

  useEffect(() => {
    // Get the upload URLs from the backend
    const fetchUploadUrls = async () => {
      try {
        const response = await fetch(`/api/truora/validation-status/${validationId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.instructions) {
            setFrontUrl(data.instructions.front_url);
            setReverseUrl(data.instructions.reverse_url);
          }
        }
      } catch (error) {
        console.error('Error fetching upload URLs:', error);
      }
    };

    if (validationId) {
      fetchUploadUrls();
    }
  }, [validationId]);

  const handleFileUpload = async (file: File, uploadUrl: string, type: 'front' | 'reverse') => {
    if (!file || !uploadUrl) return false;

    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      return response.ok;
    } catch (error) {
      console.error(`Error uploading ${type} document:`, error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!frontFile || !reverseFile) {
      setUploadStatus('Por favor selecciona ambos archivos (frente y reverso)');
      return;
    }

    setUploading(true);
    setUploadStatus('Subiendo documentos...');

    try {
      // Upload front document
      const frontSuccess = await handleFileUpload(frontFile, frontUrl, 'front');
      if (!frontSuccess) {
        throw new Error('Error al subir el frente del documento');
      }

      // Upload reverse document
      const reverseSuccess = await handleFileUpload(reverseFile, reverseUrl, 'reverse');
      if (!reverseSuccess) {
        throw new Error('Error al subir el reverso del documento');
      }

      setUploadStatus('¡Documentos subidos exitosamente! La verificación está en proceso.');
      
      // Redirect back to dashboard after 3 seconds
      setTimeout(() => {
        window.close();
        window.location.href = '/dashboard';
      }, 3000);

    } catch (error: any) {
      setUploadStatus(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (!validationId || !accountId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p>Parámetros de validación faltantes. Por favor, inicia el proceso KYC nuevamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verificación de Identidad</h1>
            <p className="text-gray-600">Sube las fotos de tu documento de identidad</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Front Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frente del Documento
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="front-upload"
                />
                <label htmlFor="front-upload" className="cursor-pointer">
                  <div className="text-gray-500">
                    {frontFile ? (
                      <p className="text-green-600">✓ {frontFile.name}</p>
                    ) : (
                      <>
                        <p>Haz clic para seleccionar la foto del frente</p>
                        <p className="text-sm">PNG, JPG hasta 10MB</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Reverse Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reverso del Documento
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReverseFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="reverse-upload"
                />
                <label htmlFor="reverse-upload" className="cursor-pointer">
                  <div className="text-gray-500">
                    {reverseFile ? (
                      <p className="text-green-600">✓ {reverseFile.name}</p>
                    ) : (
                      <>
                        <p>Haz clic para seleccionar la foto del reverso</p>
                        <p className="text-sm">PNG, JPG hasta 10MB</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !frontFile || !reverseFile}
              className={`w-full py-3 px-4 rounded-lg font-medium ${
                uploading || !frontFile || !reverseFile
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading ? 'Subiendo...' : 'Subir Documentos'}
            </button>

            {/* Status Message */}
            {uploadStatus && (
              <div className={`p-4 rounded-lg ${
                uploadStatus.includes('Error') 
                  ? 'bg-red-100 text-red-700' 
                  : uploadStatus.includes('exitosamente')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {uploadStatus}
              </div>
            )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Validation ID: {validationId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
