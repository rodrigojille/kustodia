// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Commission recipient validation
export const validateCommissionRecipient = (recipient: any) => {
  const errors: string[] = [];
  
  if (!recipient.broker_email || typeof recipient.broker_email !== 'string') {
    errors.push('Broker email is required');
  } else if (!isValidEmail(recipient.broker_email)) {
    errors.push('Broker email must be a valid email address');
  }
  
  if (recipient.broker_name && typeof recipient.broker_name !== 'string') {
    errors.push('Broker name must be a string');
  }
  
  if (recipient.broker_name && recipient.broker_name.length > 255) {
    errors.push('Broker name cannot exceed 255 characters');
  }
  
  if (typeof recipient.broker_percentage !== 'number') {
    errors.push('Broker percentage is required and must be a number');
  } else if (recipient.broker_percentage < 0 || recipient.broker_percentage > 100) {
    errors.push('Broker percentage must be between 0 and 100');
  }
  
  return errors;
};

// Main cobro payment validation
export const validateCobroPaymentData = (data: any) => {
  const errors: string[] = [];
  
  // Payment amount validation
  if (typeof data.payment_amount !== 'number' || data.payment_amount <= 0) {
    errors.push('Payment amount must be a positive number');
  }
  
  // Payment description validation
  if (!data.payment_description || typeof data.payment_description !== 'string') {
    errors.push('Payment description is required');
  } else if (data.payment_description.length > 500) {
    errors.push('Payment description cannot exceed 500 characters');
  }
  
  // Email validations
  if (!data.buyer_email || !isValidEmail(data.buyer_email)) {
    errors.push('Buyer email is required and must be valid');
  }
  
  if (!data.seller_email || !isValidEmail(data.seller_email)) {
    errors.push('Seller email is required and must be valid');
  }
  
  if (!data.broker_email || !isValidEmail(data.broker_email)) {
    errors.push('Broker email is required and must be valid');
  }
  
  // Commission percentage validation
  if (typeof data.total_commission_percentage !== 'number' || 
      data.total_commission_percentage < 0 || 
      data.total_commission_percentage > 50) {
    errors.push('Commission percentage must be between 0 and 50%');
  }
  
  // Commission recipients validation
  if (!Array.isArray(data.commission_recipients) || data.commission_recipients.length === 0) {
    errors.push('At least one commission recipient is required');
  } else {
    data.commission_recipients.forEach((recipient: any, index: number) => {
      const recipientErrors = validateCommissionRecipient(recipient);
      recipientErrors.forEach(error => {
        errors.push(`Commission recipient ${index + 1}: ${error}`);
      });
    });
  }
  
  // Custody validation
  if (data.custody_percent !== undefined) {
    if (typeof data.custody_percent !== 'number' || 
        data.custody_percent < 0 || 
        data.custody_percent > 100) {
      errors.push('Custody percentage must be between 0 and 100');
    }
  }
  
  if (data.custody_period !== undefined) {
    if (typeof data.custody_period !== 'number' || 
        data.custody_period < 1 || 
        data.custody_period > 365 || 
        !Number.isInteger(data.custody_period)) {
      errors.push('Custody period must be a whole number between 1 and 365 days');
    }
  }
  
  // Operation type validation
  const validOperationTypes = ['Enganche', 'Apartado', 'Renta', 'Compra-venta'];
  if (!data.operation_type || !validOperationTypes.includes(data.operation_type)) {
    errors.push('Operation type must be one of: Enganche, Apartado, Renta, Compra-venta');
  }
  
  // Release conditions validation
  if (!data.release_conditions || typeof data.release_conditions !== 'string') {
    errors.push('Release conditions are required');
  } else if (data.release_conditions.length > 1000) {
    errors.push('Release conditions cannot exceed 1000 characters');
  }
  
  // Transaction category validation
  const validCategories = ['inmobiliaria', 'autos', 'otros'];
  if (data.transaction_category && !validCategories.includes(data.transaction_category)) {
    errors.push('Transaction category must be one of: inmobiliaria, autos, otros');
  }
  
  return errors;
};

// Validation for commission splits
export const validateCommissionSplits = (recipients: any[]) => {
  const totalPercentage = recipients.reduce((sum, r) => sum + r.broker_percentage, 0);
  if (totalPercentage > 100) {
    return 'Total commission splits cannot exceed 100%';
  }
  return null;
};

// Validation for unique broker emails
export const validateUniqueBrokerEmails = (recipients: any[]) => {
  const emails = recipients.map((r: any) => r.broker_email);
  const uniqueEmails = new Set(emails);
  if (emails.length !== uniqueEmails.size) {
    return 'Broker emails must be unique';
  }
  return null;
};

// Combined validation for cobro payment
export const validateCobroPayment = async (data: any) => {
  try {
    const errors = validateCobroPaymentData(data);
    if (errors.length > 0) {
      return {
        isValid: false,
        errors: errors
      };
    }

    // Additional business logic validation
    const commissionSplitError = validateCommissionSplits(data.commission_recipients);
    if (commissionSplitError) {
      return {
        isValid: false,
        errors: [commissionSplitError]
      };
    }

    const uniqueEmailError = validateUniqueBrokerEmails(data.commission_recipients);
    if (uniqueEmailError) {
      return {
        isValid: false,
        errors: [uniqueEmailError]
      };
    }

    return {
      isValid: true,
      data: data
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Validation error occurred']
    };
  }
};
