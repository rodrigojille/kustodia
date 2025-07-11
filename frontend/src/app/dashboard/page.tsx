'use client';
// import { cookies } from 'next/headers'; // Removed for client component compatibility
import FintechDashboardCards from '../../components/FintechDashboardCards';
import ClabeSection from '../../components/ClabeSection';
import { ethers } from 'ethers';
import PreparingDashboardModal from '../../components/PreparingDashboardModal';
import KYCStatus from '../../components/KYCStatus';
import PaymentsByMonthChart from '../../components/PaymentsByMonthChart';
import PaymentsByStageChart from '../../components/PaymentsByStageChart';
import PaymentsTable from '../../components/PaymentsTable';
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
        console.log('[DASHBOARD] Fetching user data with authFetch (attempt', retryCount + 1, ')');
        const res = await authFetch('users/me');
        
        console.log('[DASHBOARD] authFetch response status:', res.status);
        
        if (!res.ok) {
          if (res.status === 401) {
            console.log('[DASHBOARD] 401 Unauthorized - redirecting to login');
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
        console.log('[DASHBOARD] User data received:', data);
        setUser(data.user || data); // Handle both {user: ...} and direct user object
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
      <div className="min-h-screen bg-gray-50 px-2 pt-4 pb-16 sm:px-4 md:px-8" style={{ filter: userLoading ? 'blur(2px)' : undefined, pointerEvents: userLoading ? 'none' : undefined }}>
        {/* Welcome message */}
        <div className="w-full flex justify-center">
          <div className="rounded-xl bg-blue-50 border border-blue-100 py-4 px-6 mb-6 mt-2 text-blue-800 text-xl md:text-2xl font-bold text-center shadow-sm max-w-2xl w-full">
            {user && user.full_name
              ? `¡Bienvenido, ${user.full_name}!`
              : '¡Bienvenido/a a tu panel de Kustodia!'}
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-gray-900">Dashboard</h1>
      <FintechDashboardCards />
      {/* CLABE Module */}
      <section className="flex flex-col md:flex-row gap-4 mt-6 md:mt-8 w-full">
  <div className="flex-1 bg-white rounded-lg shadow border border-gray-100 px-4 py-3 flex items-center min-h-[80px] max-w-full">
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10v6a2 2 0 002 2h14a2 2 0 002-2v-6M16 10V6a4 4 0 00-8 0v4" /></svg>
      </span>
      <div>
        <div className="text-xs font-semibold text-gray-500">CLABE y cuentas</div>
        {userLoading ? (
          <span className="text-gray-400">Cargando...</span>
        ) : userError ? (
          <span className="text-red-500">{userError}</span>
        ) : user ? (
          <ClabeSection payoutClabe={user.payout_clabe} depositClabe={user.deposit_clabe} walletAddress={user.wallet_address} mxnbsBalance={mxnbsBalance} />
        ) : null}
      </div>
    </div>
  </div>
  {/* KYC Status Module */}
  <div className="flex-1 bg-white rounded-lg shadow border border-gray-100 px-4 py-3 flex items-center min-h-[80px] max-w-full">
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      </span>
      <div>
        <div className="text-xs font-semibold text-gray-500">Estatus KYC</div>
        {userLoading ? (
          <span className="text-gray-400">Cargando...</span>
        ) : userError ? (
          <span className="text-red-500">{userError}</span>
        ) : user ? (
          <KYCStatus kycStatus={user.kyc_status} userId={user.id} userEmail={user.email} />
        ) : null}
      </div>
    </div>
  </div>
</section>
      {/* Analytics: Payments by Month, Stage, etc. */}
      <div className="mx-auto bg-gray-100 rounded-xl shadow border border-gray-200 p-2 sm:p-4 md:p-6 mt-6 md:mt-8 w-full">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">Analítica de pagos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 bg-white rounded p-4 border border-gray-200 flex flex-col justify-between">
            <div className="font-semibold mb-2 text-gray-700">Resumen</div>
            {/* Example summary: replace with real data/calculation as needed */}
            <div className="text-2xl font-bold text-blue-700">$52,000.00</div>
            <div className="text-sm text-gray-500">Total pagado este año</div>
            <div className="mt-2 text-green-600 text-sm">+12% respecto al mes pasado</div>
          </div>
          <div className="col-span-1 md:col-span-1 bg-white rounded p-4 border border-gray-200">
            <div className="font-semibold mb-2 text-gray-700">Pagos por mes</div>
            <PaymentsByMonthChart filterStage={selectedStage} onBarClick={setSelectedMonth} selectedMonth={selectedMonth} />
          </div>
          <div className="col-span-1 md:col-span-1 bg-white rounded p-4 border border-gray-200">
            <div className="font-semibold mb-2 text-gray-700">Pagos por etapa</div>
            <PaymentsByStageChart filterMonth={selectedMonth} onSliceClick={setSelectedStage} selectedStage={selectedStage} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
