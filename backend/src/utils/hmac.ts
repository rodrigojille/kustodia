import crypto from 'crypto';

const SECRET = process.env.RECEIPT_HMAC_SECRET || 'kustodia_secret_dev';

export function generatePaymentHMAC(payment: {
  id: number | string;
  amount: number | string;
  currency: string;
  payer_email: string;
  recipient_email: string;
  created_at: string | Date;
}): string {
  // Canonical string (order matters)
  const data = `${payment.id}|${payment.amount}|${payment.currency}|${payment.payer_email}|${payment.recipient_email}|${new Date(payment.created_at).toISOString()}`;
  return crypto.createHmac('sha256', SECRET).update(data).digest('hex');
}

export function verifyPaymentHMAC(payment: {
  id: number | string;
  amount: number | string;
  currency: string;
  payer_email: string;
  recipient_email: string;
  created_at: string | Date;
}, hmac: string): boolean {
  return generatePaymentHMAC(payment) === hmac;
}
