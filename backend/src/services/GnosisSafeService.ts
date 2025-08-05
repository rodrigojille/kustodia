// GnosisSafeService removed - using custom database-driven multi-sig system only
// All multi-sig functionality is handled by MultiSigApprovalService

// This file is kept as a placeholder to avoid breaking imports
// but all functionality has been moved to the custom multi-sig system

export interface SafeTransactionProposal {
  to: string;
  value: string;
  data: string;
  operation?: number;
  safeTxGas?: string;
  baseGas?: string;
  gasPrice?: string;
  gasToken?: string;
  refundReceiver?: string;
  nonce?: number;
}

export interface SafeSignature {
  signer: string;
  signature: string;
}

// Placeholder class to maintain compatibility
export class GnosisSafeService {
  async createTransaction(): Promise<any> { 
    throw new Error('GnosisSafeService removed - use MultiSigApprovalService instead'); 
  }
  
  async signTransaction(): Promise<any> { 
    throw new Error('GnosisSafeService removed - use MultiSigApprovalService instead'); 
  }
  
  async executeTransaction(): Promise<any> { 
    throw new Error('GnosisSafeService removed - use MultiSigApprovalService instead'); 
  }
  
  async getPendingTransactions(): Promise<any[]> { 
    return []; 
  }
  
  async getTransactionStatus(): Promise<any> { 
    throw new Error('GnosisSafeService removed - use MultiSigApprovalService instead'); 
  }
  
  async estimateGas(): Promise<string> { 
    return '0'; 
  }
  
  async getSafeInfo(): Promise<any> {
    throw new Error('GnosisSafeService removed - use MultiSigApprovalService instead');
  }
  
  async getSafeOwners(): Promise<string[]> {
    return [];
  }
  
  async isOwner(): Promise<boolean> {
    return false;
  }
}

export const gnosisSafeService = new GnosisSafeService();
