'use client';

import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';
import VehicleNFTForm from './VehicleNFTForm';
import PropertyNFTForm from './PropertyNFTForm';

interface AssetHistory {
  eventType: number;
  timestamp: Date;
  authorizedBy: string;
  description: string;
  transactionAmount: string;
  supportingDocs: string[];
}

interface Vehicle {
  tokenId: string;
  vin: string;
  make: string;
  model: string;
  year: string;
  color: string;
  currentMileage: string;
  hasCleanHistory: boolean;
}

interface Property {
  tokenId: string;
  cadastralId: string;
  fullAddress: string;
  city: string;
  state: string;
  propertyType: string;
  squareMeters: string;
  bedrooms: string;
  bathrooms: string;
  hasLiens: boolean;
  lastAppraisal: string;
}

const AssetDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'create-vehicle' | 'create-property' | 'search'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'vehicle' | 'property'>('vehicle');
  const [searchResult, setSearchResult] = useState<Vehicle | Property | null>(null);
  const [assetHistory, setAssetHistory] = useState<AssetHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSuccess = (result: { tokenId: string; transactionHash: string }) => {
    alert(`Asset NFT created successfully!\nToken ID: ${result.tokenId}\nTransaction: ${result.transactionHash}`);
    setActiveTab('overview');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResult(null);
    setAssetHistory([]);

    try {
      const endpoint = searchType === 'vehicle' 
        ? `/api/assets/vehicle/vin/${encodeURIComponent(searchQuery)}`
        : `/api/assets/property/cadastral/${encodeURIComponent(searchQuery)}`;

      const response = await authFetch(endpoint);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError(`${searchType === 'vehicle' ? 'Vehicle' : 'Property'} not found`);
          return;
        }
        throw new Error('Search failed');
      }

      const data = await response.json();
      const asset = searchType === 'vehicle' ? data.vehicle : data.property;
      setSearchResult(asset);

      // Fetch asset history
      if (asset?.tokenId) {
        await fetchAssetHistory(asset.tokenId);
      }

    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetHistory = async (tokenId: string) => {
    try {
      const response = await authFetch(`/api/assets/asset/${tokenId}/history`);
      if (response.ok) {
        const data = await response.json();
        setAssetHistory(data.history || []);
      }
    } catch (err) {
      console.error('Error fetching asset history:', err);
    }
  };

  const generateQRCode = async (tokenId: string) => {
    try {
      const response = await authFetch(`/api/assets/asset/${tokenId}/qr`);
      if (response.ok) {
        const data = await response.json();
        // Open verification URL in new tab
        window.open(data.verificationUrl, '_blank');
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code');
    }
  };

  const getEventTypeLabel = (eventType: number): string => {
    const types = [
      'Creation', 'Sale', 'Transfer', 'Maintenance', 'Inspection', 
      'Damage', 'Repair', 'Upgrade', 'Rental', 'Lease', 
      'Insurance Claim', 'Legal Action', 'Verification', 'Custom'
    ];
    return types[eventType] || 'Unknown';
  };

  const getPropertyTypeLabel = (propertyType: string): string => {
    const types = [
      'Residential House', 'Residential Condo', 'Commercial Office', 
      'Commercial Retail', 'Commercial Warehouse', 'Residential Land',
      'Commercial Land', 'Agricultural Land', 'Mixed Use', 'Other'
    ];
    return types[parseInt(propertyType)] || 'Unknown';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Asset Management Dashboard</h1>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview & Search' },
            { id: 'create-vehicle', label: 'Create Vehicle NFT' },
            { id: 'create-property', label: 'Create Property NFT' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Search Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Assets</h2>
            
            <div className="flex gap-4 mb-4">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'vehicle' | 'property')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="vehicle">Vehicle (by VIN)</option>
                <option value="property">Property (by Cadastral ID)</option>
              </select>
              
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchType === 'vehicle' ? 'Enter VIN' : 'Enter Cadastral ID'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <button
                onClick={handleSearch}
                disabled={loading}
                className={`px-6 py-2 rounded-md text-white font-medium ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
                {error}
              </div>
            )}

            {/* Search Results */}
            {searchResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {searchType === 'vehicle' ? 'Vehicle Details' : 'Property Details'}
                  </h3>
                  <button
                    onClick={() => generateQRCode(searchResult.tokenId)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Generate QR
                  </button>
                </div>

                {searchType === 'vehicle' && 'vin' in searchResult && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Token ID:</strong> {searchResult.tokenId}</div>
                    <div><strong>VIN:</strong> {searchResult.vin}</div>
                    <div><strong>Make:</strong> {searchResult.make}</div>
                    <div><strong>Model:</strong> {searchResult.model}</div>
                    <div><strong>Year:</strong> {searchResult.year}</div>
                    <div><strong>Color:</strong> {searchResult.color}</div>
                    <div><strong>Mileage:</strong> {searchResult.currentMileage} km</div>
                    <div><strong>Clean History:</strong> {searchResult.hasCleanHistory ? 'Yes' : 'No'}</div>
                  </div>
                )}

                {searchType === 'property' && 'cadastralId' in searchResult && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Token ID:</strong> {searchResult.tokenId}</div>
                    <div><strong>Cadastral ID:</strong> {searchResult.cadastralId}</div>
                    <div><strong>Address:</strong> {searchResult.fullAddress}</div>
                    <div><strong>City:</strong> {searchResult.city}</div>
                    <div><strong>State:</strong> {searchResult.state}</div>
                    <div><strong>Type:</strong> {getPropertyTypeLabel(searchResult.propertyType)}</div>
                    <div><strong>Area:</strong> {searchResult.squareMeters} m²</div>
                    <div><strong>Bedrooms:</strong> {searchResult.bedrooms}</div>
                    <div><strong>Bathrooms:</strong> {searchResult.bathrooms}</div>
                    <div><strong>Has Liens:</strong> {searchResult.hasLiens ? 'Yes' : 'No'}</div>
                    <div><strong>Last Appraisal:</strong> ${searchResult.lastAppraisal} ETH</div>
                  </div>
                )}
              </div>
            )}

            {/* Asset History */}
            {assetHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Asset History</h3>
                <div className="space-y-3">
                  {assetHistory.map((event, index) => (
                    <div key={index} className="p-3 bg-white border border-gray-200 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-800">
                            {getEventTypeLabel(event.eventType)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {event.description}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(event.timestamp).toLocaleString()}
                          </div>
                        </div>
                        {event.transactionAmount !== '0.0' && (
                          <div className="text-sm font-medium text-green-600">
                            ${event.transactionAmount} ETH
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Vehicle NFTs</h3>
              <p className="text-3xl font-bold text-blue-600">-</p>
              <p className="text-sm text-gray-600">Total created</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Property NFTs</h3>
              <p className="text-3xl font-bold text-green-600">-</p>
              <p className="text-sm text-gray-600">Total created</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Value</h3>
              <p className="text-3xl font-bold text-purple-600">-</p>
              <p className="text-sm text-gray-600">Asset value tracked</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create-vehicle' && (
        <VehicleNFTForm 
          onSuccess={handleCreateSuccess}
          onCancel={() => setActiveTab('overview')}
        />
      )}

      {activeTab === 'create-property' && (
        <PropertyNFTForm 
          onSuccess={handleCreateSuccess}
          onCancel={() => setActiveTab('overview')}
        />
      )}
    </div>
  );
};

export default AssetDashboard;
