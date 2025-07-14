import { authFetch } from './utils/authFetch';

export default async function fetchPayments() {
  const res = await authFetch('payments');

  if (!res.ok) {
    throw new Error(`Failed to fetch payments: ${res.status}`);
  }

  const data = await res.json();
  // Handle both {payments: [...]} and direct array formats
  return Array.isArray(data) ? data : (data.payments || []);
}
