import ClientAuthGuard from "../../components/ClientAuthGuard";

export default function PagosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientAuthGuard>
      {children}
    </ClientAuthGuard>
  );
}
