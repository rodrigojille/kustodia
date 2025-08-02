'use client';

import { useSearchParams } from 'next/navigation';
import PaymentsTable from '../../../components/PaymentsTable';
import Link from 'next/link';

const PaymentsPage = () => {
  const searchParams = useSearchParams();
  const statusFilter = searchParams?.get('status');

  const getPageTitle = () => {
    if (!statusFilter) return 'Todos los Pagos';
    switch (statusFilter) {
      case 'pending':
        return 'Pagos Pendientes';
      case 'escrowed':
        return 'Pagos en Custodia';
      case 'completed':
        return 'Pagos Finalizados';
      default:
        return `Pagos: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`;
    }
  };

  return (
    <div className="px-2 pt-4 pb-16 sm:px-4 md:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 sm:gap-0">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
        <Link href="/dashboard/pagos" className="text-sm font-medium text-primary hover:text-primary-dark transition">
          Ver todos los pagos
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow border border-gray-200 p-0 sm:p-0 md:p-0 max-w-full overflow-hidden">
        <PaymentsTable />
      </div>
    </div>
  );
};

export default PaymentsPage;
