import PaymentsTable from '../../../components/PaymentsTable';
import Link from 'next/link';

export default function PagosPage() {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Pagos</h1>
          <p className="page-description">Historial completo de tus transacciones</p>
        </div>

        {/* Main Content Card */}
        <div className="card-primary p-4 sm:p-6 lg:p-8">
          <PaymentsTable />
        </div>
      </div>
    </div>
  );
}
