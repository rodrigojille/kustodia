/**
 * Unified Payment Status Configuration
 * Used across all components: Dashboard Cards, Table, Charts, etc.
 */

export interface PaymentStatusConfig {
  key: string;
  label: string;
  spanish: string;
  icon: string;
  color: string;
  bgClass: string;
  textClass: string;
  automationBadge: boolean;
}

export const PAYMENT_STATUSES: Record<string, PaymentStatusConfig> = {
  pending: {
    key: 'pending',
    label: 'Pendientes',
    spanish: 'Pagos pendientes',
    icon: '⏳',
    color: '#eab308', // yellow-500
    bgClass: 'bg-yellow-50 border-yellow-200',
    textClass: 'bg-yellow-100 text-yellow-700',
    automationBadge: false
  },
  funded: {
    key: 'funded',
    label: 'Financiados',
    spanish: 'Pagos financiados',
    icon: '💰',
    color: '#22c55e', // green-500
    bgClass: 'bg-green-50 border-green-200',
    textClass: 'bg-green-100 text-green-700',
    automationBadge: true
  },
  escrowed: {
    key: 'escrowed',
    label: 'En custodia',
    spanish: 'Pagos en custodia',
    icon: '🔒',
    color: '#8b5cf6', // purple-500
    bgClass: 'bg-purple-50 border-purple-200',
    textClass: 'bg-purple-100 text-purple-700',
    automationBadge: true
  },
  completed: {
    key: 'completed',
    label: 'Completados',
    spanish: 'Pagos completados',
    icon: '🎉',
    color: '#10b981', // emerald-500
    bgClass: 'bg-emerald-50 border-emerald-200',
    textClass: 'bg-emerald-100 text-emerald-700',
    automationBadge: true
  },
  in_dispute: {
    key: 'in_dispute',
    label: 'En disputa',
    spanish: 'Pagos en disputa',
    icon: '⚠️',
    color: '#ef4444', // red-500
    bgClass: 'bg-red-50 border-red-200',
    textClass: 'bg-red-100 text-red-700',
    automationBadge: false
  },
  cancelled: {
    key: 'cancelled',
    label: 'Cancelados',
    spanish: 'Pagos cancelados',
    icon: '❌',
    color: '#6b7280', // gray-500
    bgClass: 'bg-gray-50 border-gray-200',
    textClass: 'bg-gray-100 text-gray-600',
    automationBadge: false
  }
};

// Card display order for dashboard
export const CARD_ORDER = ['pending', 'funded', 'escrowed', 'completed', 'in_dispute', 'cancelled'];

// Statuses that have automation badges
export const AUTOMATED_STATUSES = ['funded', 'escrowed', 'completed'];

// Status mapping for legacy/deprecated statuses
export const LEGACY_STATUS_MAP: Record<string, string> = {
  'processing': 'pending',
  'paid': 'funded',
  'requested': 'pending',
  'active': 'escrowed',
  'refunded': 'cancelled',
  'en_custodia': 'escrowed',
  'in_progress': 'escrowed'
};

// Helper functions
export const getStatusConfig = (status: string): PaymentStatusConfig => {
  // Handle legacy statuses
  const mappedStatus = LEGACY_STATUS_MAP[status] || status;
  return PAYMENT_STATUSES[mappedStatus] || PAYMENT_STATUSES.cancelled;
};

export const getStatusLabel = (status: string): string => {
  return getStatusConfig(status).label;
};

export const getStatusSpanish = (status: string): string => {
  return getStatusConfig(status).spanish;
};

export const hasAutomationBadge = (status: string): boolean => {
  return getStatusConfig(status).automationBadge;
};
