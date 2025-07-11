import { authFetch } from './utils/authFetch';

export default async function fetchPaymentById(paymentId: string) {
  const res = await authFetch(`payments/${paymentId}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch payment: ${res.status}`);
  }

  const data = await res.json();
  return data.payment || data;
}
