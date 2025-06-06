import PaymentsTable from '../../components/PaymentsTable';
import Link from 'next/link';

export default function PagosPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
        <Link href="/pagos/nuevo" className="bg-primary text-black rounded px-4 py-2 font-semibold shadow hover:bg-primary-dark transition">Nuevo movimiento</Link>
      </div>
      <PaymentsTable />
    </div>
  );
}
