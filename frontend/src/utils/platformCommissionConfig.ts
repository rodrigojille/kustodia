/**
 * Platform Commission Configuration for Frontend
 * Matches backend configuration for transparent commission display
 */

export type PaymentFlowType = 'traditional' | 'nuevo_flujo' | 'cobro_inteligente';

/**
 * Get platform commission percentage for a payment flow type
 * These should match the backend environment variables
 */
export function getPlatformCommissionPercent(paymentFlow: PaymentFlowType): number {
  // Default commission percentages (should be configured via environment)
  const commissions = {
    traditional: parseFloat(process.env.NEXT_PUBLIC_PLATFORM_COMMISSION_TRADITIONAL || '0'),
    nuevo_flujo: parseFloat(process.env.NEXT_PUBLIC_PLATFORM_COMMISSION_NUEVO_FLUJO || '0'),
    cobro_inteligente: parseFloat(process.env.NEXT_PUBLIC_PLATFORM_COMMISSION_COBRO_INTELIGENTE || '0')
  };
  
  // Debug logging
  console.log('[PLATFORM COMMISSION DEBUG] Environment Variables:', {
    NEXT_PUBLIC_PLATFORM_COMMISSION_TRADITIONAL: process.env.NEXT_PUBLIC_PLATFORM_COMMISSION_TRADITIONAL,
    NEXT_PUBLIC_PLATFORM_COMMISSION_NUEVO_FLUJO: process.env.NEXT_PUBLIC_PLATFORM_COMMISSION_NUEVO_FLUJO,
    NEXT_PUBLIC_PLATFORM_COMMISSION_COBRO_INTELIGENTE: process.env.NEXT_PUBLIC_PLATFORM_COMMISSION_COBRO_INTELIGENTE
  });
  console.log('[PLATFORM COMMISSION DEBUG] Calculation:', {
    paymentFlow,
    commissions,
    result: commissions[paymentFlow] || 0
  });
  
  return commissions[paymentFlow] || 0;
}

/**
 * Calculate platform commission amount and total to pay
 */
export function calculatePlatformCommission(
  amount: number,
  paymentFlow: PaymentFlowType
): {
  percent: number;
  amount: number;
  totalAmountToPay: number;
} {
  const percent = getPlatformCommissionPercent(paymentFlow);
  const commissionAmount = (amount * percent) / 100;
  const totalAmountToPay = amount + commissionAmount;
  
  return {
    percent,
    amount: commissionAmount,
    totalAmountToPay
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
