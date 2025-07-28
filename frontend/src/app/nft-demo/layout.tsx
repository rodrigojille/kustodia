import ClientAuthGuard from "../../components/ClientAuthGuard";
import DashboardShell from "../../components/DashboardShell";

export default function NFTDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthGuard>
      <DashboardShell>
        {children}
      </DashboardShell>
    </ClientAuthGuard>
  );
}
