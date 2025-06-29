export async function fetchPayments() {
  // TODO: Usa variable de entorno para el endpoint real
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const res = await fetch("http://localhost:4000/api/payments/user-payments", {
    credentials: "include",
    headers: token ? { "Authorization": `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Error al obtener pagos");
  const data = await res.json();
  return data.payments;
}
