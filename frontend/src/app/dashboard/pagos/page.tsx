import PaymentsTable from '../../../components/PaymentsTable';
import Link from 'next/link';

export default function PagosPage() {
  return (
    <div className="px-2 pt-4 pb-16 sm:px-4 md:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 sm:gap-0">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Pagos</h1>
        <Link href="/dashboard/pagos/nuevo" className="w-full sm:w-auto bg-primary text-black rounded px-4 py-2 font-semibold shadow hover:bg-primary-dark transition text-center">Nuevo movimiento</Link>
      </div>
      <div className="bg-white rounded-xl shadow border border-gray-200 p-2 sm:p-4 md:p-6 max-w-full">
        <PaymentsTable />
      </div>
    </div>
  );
}
