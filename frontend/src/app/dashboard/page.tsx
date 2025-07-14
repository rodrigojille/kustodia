'use client';
// import { cookies } from 'next/headers'; // Removed for client component compatibility
// New Revolut-style components
import RevolutStatusCards from '../../components/RevolutStatusCards';
import RevolutAccountCards from '../../components/RevolutAccountCards';
import { ArcadeEmbed } from '../../components/ArcadeEmbed';
import { ethers } from 'ethers';
import PreparingDashboardModal from '../../components/PreparingDashboardModal';


import { authFetch } from '../../utils/authFetch';

// getUserInfo removed for client component compatibility

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function DashboardHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
  };
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  const [mxnbsBalance, setMxnbsBalance] = useState<string | null>(null);

  // Handle URL token extraction for development mode (Google SSO)
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      console.log('[DASHBOARD] Token found in URL, storing in localStorage for development');
      localStorage.setItem('auth_token', token);
      // Clean up URL by removing token parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('token');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 2;
    
    const fetchUserWithRetry = async () => {
      try {
        // Debug: Check localStorage token before making API call
        const token = localStorage.getItem('auth_token');
        console.log('[DASHBOARD] Token check before API call:', {
          hasToken: !!token,
          tokenLength: token?.length || 0,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
        });
        
        console.log('[DASHBOARD] Fetching user data with authFetch (attempt', retryCount + 1, ')');
        const res = await authFetch('users/me');
        
        console.log('[DASHBOARD] authFetch response status:', res.status);
        
        if (!res.ok) {
          if (res.status === 401) {
            console.log('[DASHBOARD] 401 Unauthorized - redirecting to login');
            try {
              // Debug: Check localStorage token
              const token = localStorage.getItem('auth_token');
              console.log('[DASHBOARD] Token check:', {
                hasToken: !!token,
                tokenLength: token?.length || 0,
                tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
              });
            } catch (error) {
              console.error('[DASHBOARD] Error checking localStorage token:', error);
            }
            throw new Error('UNAUTHORIZED');
          }
          if (res.status >= 500 && retryCount < maxRetries) {
            console.log('[DASHBOARD] Server error, retrying...');
            retryCount++;
            setTimeout(fetchUserWithRetry, 1000 * retryCount); // Exponential backoff
            return;
          }
          throw new Error(`Server error: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('[DASHBOARD] ✅ SUCCESS! Raw API response:', data);
        
        // Backend returns user data wrapped in 'user' property
        const userData = data.user || data; // Fallback to data if no user wrapper
        
        console.log('[DASHBOARD] User KYC status from API:', userData?.kyc_status);
        console.log('[DASHBOARD] User wallet address from API:', userData?.wallet_address);
        console.log('[DASHBOARD] User payout_clabe from API:', userData?.payout_clabe);
        console.log('[DASHBOARD] Full user object:', JSON.stringify(userData, null, 2));
        
        // Verify the data structure
        console.log('[DASHBOARD] Data verification:', {
          hasKycStatus: 'kyc_status' in userData,
          hasWalletAddress: 'wallet_address' in userData,
          hasPayoutClabe: 'payout_clabe' in userData,
          kycValue: userData.kyc_status,
          walletValue: userData.wallet_address,
          clabeValue: userData.payout_clabe,
          dataKeys: Object.keys(userData)
        });
        
        setUser(userData); // Use the unwrapped user data
        console.log('[DASHBOARD] User state set, triggering re-render');
        setUserLoading(false);
        setUserError(null);
        
      } catch (error: any) {
        console.error('[DASHBOARD] Authentication error:', error);
        
        if (error.message === 'UNAUTHORIZED') {
          // Only redirect on actual auth failure
          setUserLoading(false);
          router.push('/login');
        } else if (retryCount < maxRetries) {
          // Retry on network/server errors
          console.log('[DASHBOARD] Retrying due to network error...');
          retryCount++;
          setTimeout(fetchUserWithRetry, 1000 * retryCount);
        } else {
          // Max retries reached, show error but don't logout
          console.error('[DASHBOARD] Max retries reached, showing error');
          setUserError('Failed to load user data. Please refresh the page.');
          setUserLoading(false);
        }
      }
    };
    
    // Wait a bit for token to be stored from URL if present
    setTimeout(fetchUserWithRetry, 100);
  }, [router]);

  // Fetch balances when user.wallet_address is available
  useEffect(() => {
    const fetchMxnbsBalance = async () => {
      if (!user || !user.wallet_address) return;
      try {
        // MXNBS Arbitrum Sepolia (ERC20)
        const arbProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL);
        const mxnbAddress = process.env.NEXT_PUBLIC_MXNB_CONTRACT_ADDRESS;
        if (!mxnbAddress) {
          setMxnbsBalance(null);
          return;
        }
        const erc20Abi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
        const mxnb = new ethers.Contract(mxnbAddress, erc20Abi, arbProvider);
        const bal = await mxnb.balanceOf(user.wallet_address);
        let decimals = 18;
        try { decimals = await mxnb.decimals(); } catch {}
        setMxnbsBalance(ethers.formatUnits(bal, decimals));
      } catch (e) {
        setMxnbsBalance(null);
      }
    };
    fetchMxnbsBalance();
  }, [user]);

  return (
    <>
      <PreparingDashboardModal open={userLoading} />
      <div className="page-container" style={{ filter: userLoading ? 'blur(2px)' : undefined, pointerEvents: userLoading ? 'none' : undefined }}>
        <div className="content-wrapper">
          {/* Simplified Welcome Header */}
          <div className="page-header text-center">
            <h1 className="page-title">
              {user && user.full_name ? `¡Hola, ${user.full_name}!` : 'Dashboard'}
            </h1>
          </div>

          {/* Hero Section - Create Payment CTA */}
          <div className="mb-6 md:mb-8">
            <div 
              className="rounded-2xl shadow-lg p-6 md:p-8 lg:p-10 text-white text-center hover:shadow-xl transition-all duration-300 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                boxShadow: '0 10px 30px -5px rgba(59, 130, 246, 0.3)'
              }}
              onClick={() => router.push('/dashboard/crear-pago')}
            >
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Crear Nuevo Pago</h2>
                <p className="text-blue-100 text-base md:text-lg mb-6 md:mb-8">
                  Inicia un pago con condiciones de liberación seguras y automatizadas
                </p>
                <div className="inline-flex items-center bg-white text-blue-600 font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-blue-50 transition-colors text-sm md:text-base">
                  <span className="mr-2">Comenzar ahora</span>
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Estado de pagos */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Estado de pagos</h3>
            <RevolutStatusCards />
          </div>

          {/* Mi Información */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Mi Información</h3>
            <RevolutAccountCards 
              user={user}
              mxnbsBalance={mxnbsBalance}
              loading={userLoading}
              error={userError}
              onUserUpdate={(updatedUser) => setUser(updatedUser)}
            />
          </div>

          {/* Acciones Rápidas */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <button 
                onClick={() => router.push('/dashboard/crear-pago')}
                className="card-primary p-4 hover:shadow-lg transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Nuevo Pago</h4>
                    <p className="text-sm text-gray-600">Crear pago seguro</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/soporte')}
                className="card-primary p-4 hover:shadow-lg transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Soporte</h4>
                    <p className="text-sm text-gray-600">Ayuda y soporte</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/configuracion')}
                className="card-primary p-4 hover:shadow-lg transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Configuración</h4>
                    <p className="text-sm text-gray-600">Ajustes y preferencias</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Guía Rápida */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Guía Rápida</h3>
            <div className="card-primary p-4 md:p-6">
              <div className="text-center mb-3 md:mb-4">
                <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">¿Nuevo en Kustodia?</h4>
                <p className="text-sm md:text-base text-gray-600">Aprende cómo crear y gestionar pagos seguros en solo 3 minutos</p>
              </div>
              <div className="max-w-4xl mx-auto">
                <div className="rounded-lg overflow-hidden shadow-sm">
                  <ArcadeEmbed />
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
