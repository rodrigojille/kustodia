export async function fetchPaymentById(id: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const res = await fetch(`http://localhost:4000/api/payments/${id}`, {
    credentials: "include",
    headers: token ? { "Authorization": `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Error al obtener el pago");
  const data = await res.json();
  return data.payment || data;
}
