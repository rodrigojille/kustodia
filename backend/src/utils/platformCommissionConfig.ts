/**
 * Platform Commission Configuration
 * Simplified for three main payment flows: standard, nuevo_flujo, cobro_inteligente
 */

export type PaymentFlowType = 'traditional' | 'nuevo_flujo' | 'cobro_inteligente';

/**
 * Get platform commission percentage based on payment flow type
 */
export function getPlatformCommissionPercent(paymentFlow: PaymentFlowType): number {
  switch (paymentFlow) {
    case 'traditional':
      return parseFloat(process.env.PLATFORM_COMMISSION_TRADITIONAL || '0');
    case 'nuevo_flujo':
      return parseFloat(process.env.PLATFORM_COMMISSION_NUEVO_FLUJO || '0');
    case 'cobro_inteligente':
      return parseFloat(process.env.PLATFORM_COMMISSION_COBRO_INTELIGENTE || '0');
    default:
      return parseFloat(process.env.PLATFORM_COMMISSION_PERCENT || '0');
  }
}

/**
 * Calculate platform commission amount
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
    amount: Math.round(commissionAmount * 100) / 100, // Round to 2 decimals
    totalAmountToPay: Math.round(totalAmountToPay * 100) / 100
  };
}

/**
 * Get commission breakdown for display
 */
export function getCommissionBreakdown(
  amount: number,
  paymentFlow: PaymentFlowType,
  brokerCommissionPercent: number = 0
): {
  baseAmount: number;
  platformCommission: {
    percent: number;
    amount: number;
  };
  brokerCommission: {
    percent: number;
    amount: number;
  };
  totalAmountToPay: number;
  sellerReceives: number;
} {
  const platform = calculatePlatformCommission(amount, paymentFlow);
  const brokerCommissionAmount = (amount * brokerCommissionPercent) / 100;
  const sellerReceives = amount - brokerCommissionAmount;
  
  return {
    baseAmount: amount,
    platformCommission: {
      percent: platform.percent,
      amount: platform.amount
    },
    brokerCommission: {
      percent: brokerCommissionPercent,
      amount: Math.round(brokerCommissionAmount * 100) / 100
    },
    totalAmountToPay: platform.totalAmountToPay,
    sellerReceives: Math.round(sellerReceives * 100) / 100
  };
}
