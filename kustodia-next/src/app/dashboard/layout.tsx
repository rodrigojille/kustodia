import ClientAuthGuard from "../../components/ClientAuthGuard";
import DashboardShell from "../../components/DashboardShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </ClientAuthGuard>
  );
}
