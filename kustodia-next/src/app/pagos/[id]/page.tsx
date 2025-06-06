import PaymentDetailClient from '../../../components/PaymentDetailClient';
import DashboardShell from '../../../components/DashboardShell';

export default function PagoDetallePage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <PaymentDetailClient id={params.id} />
    </DashboardShell>
  );
}
