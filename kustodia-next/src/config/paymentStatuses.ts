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
  requested: {
    key: 'requested',
    label: 'Creados',
    spanish: 'Pagos creados',
    icon: '📝',
    color: '#6366f1', // indigo-500
    bgClass: 'bg-indigo-50 border-indigo-200',
    textClass: 'bg-indigo-100 text-indigo-700',
    automationBadge: false
  },
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
  paid: {
    key: 'paid',
    label: 'Activos',
    spanish: 'Pagos activos',
    icon: '✅',
    color: '#10b981', // emerald-500
    bgClass: 'bg-emerald-50 border-emerald-200',
    textClass: 'bg-emerald-100 text-emerald-700',
    automationBadge: true
  },
  completed: {
    key: 'completed',
    label: 'Completados',
    spanish: 'Pagos completados',
    icon: '🎉',
    color: '#22c55e', // green-500
    bgClass: 'bg-green-50 border-green-200',
    textClass: 'bg-green-100 text-green-700',
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
export const CARD_ORDER = ['requested', 'pending', 'paid', 'completed', 'in_dispute', 'cancelled'];

// Statuses that have automation badges
export const AUTOMATED_STATUSES = ['paid', 'completed'];

// Status mapping for legacy/deprecated statuses
export const LEGACY_STATUS_MAP: Record<string, string> = {
  'processing': 'pending',
  'funded': 'paid',
  'refunded': 'cancelled',
  'active': 'paid'
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
