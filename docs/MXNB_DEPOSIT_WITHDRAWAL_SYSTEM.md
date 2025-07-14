# MXNB Deposit & Withdrawal System - Implementation Plan

## Overview
Complete bidirectional MXNB token system allowing users to:
1. **Deposit MXN** → Convert to MXNB → Credit to user wallet
2. **Withdraw MXNB** → Convert to MXN → Transfer to user's bank account

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User's Bank   │    │  Kustodia Bridge │    │   User Wallet   │
│    Account      │◄──►│     Wallet       │◄──►│   (Portal)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
    ┌────▼────┐              ┌────▼────┐              ┌────▼────┐
    │  Juno   │              │  Juno   │              │ Portal  │
    │   API   │              │ MXNB    │              │   API   │
    │         │              │ Bridge  │              │         │
    └─────────┘              └─────────┘              └─────────┘
```

---

## 🏦 DEPOSIT FLOW: MXN → MXNB

### Process Overview
1. **User Deposits MXN** → Transfer to their unique deposit CLABE
2. **Juno Detection** → Webhook/polling detects incoming MXN
3. **MXNB Minting** → Juno converts MXN to MXNB in bridge wallet
4. **User Credit** → Portal transfers MXNB from bridge to user wallet

### Technical Implementation

#### Step 1: MXN Deposit Detection
```typescript
// Enhanced JunoService for deposit detection
class JunoService {
  async checkIncomingDeposits(): Promise<DepositTransaction[]> {
    // Poll Juno API for incoming transfers to user CLABEs
    const deposits = await this.junoApi.getIncomingTransfers({
      accounts: await this.getAllUserDepositClabes(),
      since: this.lastCheckTimestamp
    });
    
    return deposits.map(deposit => ({
      user_id: this.getUserByDepositClabe(deposit.destination_clabe),
      amount_mxn: deposit.amount,
      juno_transaction_id: deposit.transaction_id,
      deposit_clabe: deposit.destination_clabe
    }));
  }
}
```

#### Step 2: MXNB Minting & Bridge Management
```typescript
// New DepositService
class DepositService {
  async processDeposit(deposit: DepositTransaction): Promise<void> {
    try {
      // 1. Create deposit record
      const depositRecord = await this.createDepositRecord(deposit);
      
      // 2. Request MXNB minting via Juno
      const mxnbAmount = await this.junoService.mintMXNB({
        amount_mxn: deposit.amount_mxn,
        destination_wallet: BRIDGE_WALLET_ADDRESS
      });
      
      // 3. Transfer MXNB from bridge to user wallet
      await this.portalService.transferMXNB({
        from: BRIDGE_WALLET_ADDRESS,
        to: deposit.user.wallet_address,
        amount: mxnbAmount
      });
      
      // 4. Update deposit status
      await this.completeDeposit(depositRecord.id);
      
      // 5. Notify user
      await this.notificationService.createAccountNotifications(
        deposit.user_id, 
        'mxnb_deposit_completed'
      );
      
    } catch (error) {
      await this.handleDepositError(deposit, error);
    }
  }
}
```

#### Step 3: Database Schema for Deposits
```sql
-- Deposits table
CREATE TABLE deposits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount_mxn DECIMAL(10,2) NOT NULL,
  amount_mxnb DECIMAL(18,8) NOT NULL,
  deposit_clabe VARCHAR(18) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  juno_transaction_id VARCHAR(255),
  bridge_tx_hash VARCHAR(255),
  user_tx_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT
);

-- Index for efficient querying
CREATE INDEX idx_deposits_user_status ON deposits(user_id, status);
CREATE INDEX idx_deposits_clabe ON deposits(deposit_clabe);
```

---

## 💸 WITHDRAWAL FLOW: MXNB → MXN

### Process Overview
1. **User Initiates Withdrawal** → Specifies MXNB amount to withdraw
2. **MXNB Transfer** → Portal moves MXNB from user wallet to bridge wallet
3. **MXNB Redemption** → Juno converts MXNB to MXN
4. **MXN Payout** → Juno transfers MXN to user's payout CLABE

### Technical Implementation

#### Step 1: Withdrawal Initiation & Validation
```typescript
// Enhanced WithdrawalController
class WithdrawalController {
  async initiateWithdrawal(req: Request, res: Response): Promise<void> {
    const { amount_mxnb } = req.body;
    const user = req.user;
    
    // Validation
    const userBalance = await this.portalService.getMXNBBalance(user.wallet_address);
    if (userBalance < amount_mxnb) {
      throw new Error('Insufficient MXNB balance');
    }
    
    if (!user.payout_clabe) {
      throw new Error('No payout CLABE registered');
    }
    
    // Calculate fees and net amount
    const fees = this.calculateWithdrawalFees(amount_mxnb);
    const net_mxn = await this.junoService.getMXNBToMXNRate(amount_mxnb) - fees;
    
    // Create withdrawal record
    const withdrawal = await this.withdrawalService.createWithdrawal({
      user_id: user.id,
      amount_mxnb,
      amount_mxn: net_mxn,
      fee_mxn: fees,
      payout_clabe: user.payout_clabe
    });
    
    // Start async processing
    this.withdrawalService.processWithdrawal(withdrawal.id);
    
    res.json({ withdrawal_id: withdrawal.id, status: 'initiated' });
  }
}
```

#### Step 2: MXNB Transfer & Redemption
```typescript
class WithdrawalService {
  async processWithdrawal(withdrawalId: number): Promise<void> {
    const withdrawal = await this.getWithdrawal(withdrawalId);
    
    try {
      // 1. Transfer MXNB from user to bridge wallet
      const bridgeTxHash = await this.portalService.transferMXNB({
        from: withdrawal.user.wallet_address,
        to: BRIDGE_WALLET_ADDRESS,
        amount: withdrawal.amount_mxnb
      });
      
      await this.updateWithdrawal(withdrawalId, {
        status: 'transferring',
        bridge_tx_hash: bridgeTxHash
      });
      
      // 2. Redeem MXNB for MXN via Juno
      const junoTxId = await this.junoService.redeemMXNB({
        amount_mxnb: withdrawal.amount_mxnb,
        destination_clabe: withdrawal.payout_clabe
      });
      
      await this.updateWithdrawal(withdrawalId, {
        status: 'completed',
        juno_transaction_id: junoTxId,
        completed_at: new Date()
      });
      
      // 3. Notify user
      await this.notificationService.createAccountNotifications(
        withdrawal.user_id,
        'mxnb_withdrawal_completed'
      );
      
    } catch (error) {
      await this.handleWithdrawalError(withdrawalId, error);
    }
  }
}
```

---

## 🔧 Enhanced Services Integration

### Portal Service Enhancements
```typescript
class PortalService {
  // Get MXNB balance for user wallet
  async getMXNBBalance(walletAddress: string): Promise<number> {
    const response = await this.portalApi.get(
      `/v1/wallets/${walletAddress}/assets`,
      {
        params: {
          contractAddress: MXNB_CONTRACT_ADDRESS,
          chain: 'eip155:421614' // Arbitrum Sepolia
        }
      }
    );
    return parseFloat(response.data.balance || '0');
  }
  
  // Transfer MXNB between wallets
  async transferMXNB(params: {
    from: string;
    to: string;
    amount: number;
  }): Promise<string> {
    const transaction = await this.portalApi.post('/v1/transactions/sign', {
      from: params.from,
      to: MXNB_CONTRACT_ADDRESS,
      data: this.encodeMXNBTransfer(params.to, params.amount),
      chain: 'eip155:421614'
    });
    
    return transaction.data.hash;
  }
}
```

### Juno Service Enhancements
```typescript
class JunoService {
  // Mint MXNB tokens (deposit flow)
  async mintMXNB(params: {
    amount_mxn: number;
    destination_wallet: string;
  }): Promise<number> {
    const response = await this.junoApi.post('/mxnb/mint', {
      amount_mxn: params.amount_mxn,
      destination_wallet: params.destination_wallet
    });
    return response.data.mxnb_amount;
  }
  
  // Redeem MXNB for MXN (withdrawal flow)
  async redeemMXNB(params: {
    amount_mxnb: number;
    destination_clabe: string;
  }): Promise<string> {
    const response = await this.junoApi.post('/mxnb/redeem', {
      amount_mxnb: params.amount_mxnb,
      destination_clabe: params.destination_clabe
    });
    return response.data.transaction_id;
  }
  
  // Get current MXNB to MXN exchange rate
  async getMXNBToMXNRate(amount_mxnb: number): Promise<number> {
    const response = await this.junoApi.get('/mxnb/rate', {
      params: { amount: amount_mxnb }
    });
    return response.data.mxn_amount;
  }
}
```

---

## 📊 API Endpoints

### Deposit Endpoints
```typescript
// GET /api/deposits/history - User deposit history
// GET /api/deposits/:id/status - Check deposit status
// POST /api/deposits/simulate - Simulate deposit (calculate MXNB amount)
```

### Withdrawal Endpoints
```typescript
// POST /api/withdrawals/initiate - Start withdrawal
// GET /api/withdrawals/:id/status - Check withdrawal status
// GET /api/withdrawals/history - User withdrawal history
// POST /api/withdrawals/:id/cancel - Cancel pending withdrawal
// GET /api/withdrawals/fees - Get current withdrawal fees
```

### Balance & Rate Endpoints
```typescript
// GET /api/wallet/mxnb-balance - Get user's MXNB balance
// GET /api/rates/mxn-to-mxnb - Get current conversion rates
// GET /api/rates/mxnb-to-mxn - Get current redemption rates
```

---

## 🔄 Automation & Monitoring

### Deposit Detection Service
```typescript
// Automated service running every 30 seconds
class DepositDetectionService {
  async run(): Promise<void> {
    const newDeposits = await this.junoService.checkIncomingDeposits();
    
    for (const deposit of newDeposits) {
      await this.depositService.processDeposit(deposit);
    }
  }
}
```

### Status Monitoring
```typescript
// Monitor stuck transactions and retry failed operations
class TransactionMonitorService {
  async monitorPendingTransactions(): Promise<void> {
    // Check deposits stuck in processing
    const stuckDeposits = await this.getStuckDeposits();
    for (const deposit of stuckDeposits) {
      await this.retryDeposit(deposit);
    }
    
    // Check withdrawals stuck in processing
    const stuckWithdrawals = await this.getStuckWithdrawals();
    for (const withdrawal of stuckWithdrawals) {
      await this.retryWithdrawal(withdrawal);
    }
  }
}
```

---

## 🛡️ Security & Risk Management

### Rate Limiting
- **Deposits**: No limits (user's own money)
- **Withdrawals**: Daily limit of $10,000 MXN equivalent
- **API Calls**: 100 requests per minute per user

### Fraud Detection
- **Unusual Patterns**: Large deposits followed by immediate withdrawals
- **Velocity Checks**: Multiple rapid transactions
- **Amount Validation**: Deposits/withdrawals above threshold require manual review

### Error Recovery
- **Failed Deposits**: Manual intervention queue for finance team
- **Failed Withdrawals**: Automatic MXNB refund to user wallet
- **Bridge Wallet Management**: Automated rebalancing and monitoring

---

## 📈 Implementation Timeline

### Phase 1: Core Infrastructure (3-4 days)
- [ ] Database schema for deposits/withdrawals
- [ ] Enhanced Portal service methods
- [ ] Enhanced Juno service methods
- [ ] Basic API endpoints

### Phase 2: Deposit Flow (3-4 days)
- [ ] Deposit detection service
- [ ] MXNB minting integration
- [ ] Bridge wallet management
- [ ] User notification system

### Phase 3: Withdrawal Flow (3-4 days)
- [ ] Withdrawal initiation UI
- [ ] MXNB transfer to bridge
- [ ] Juno redemption integration
- [ ] Status tracking and notifications

### Phase 4: Frontend Integration (2-3 days)
- [ ] Deposit/withdrawal UI components
- [ ] Transaction history pages
- [ ] Real-time status updates
- [ ] Balance display enhancements

### Phase 5: Testing & Monitoring (2-3 days)
- [ ] End-to-end testing
- [ ] Error handling validation
- [ ] Performance optimization
- [ ] Monitoring dashboard

**Total Estimated Time: 13-18 days**

---

## 🔗 Dependencies

### ✅ Already Available
- Portal v1 API integration
- Juno API integration
- User deposit CLABE system
- User payout CLABE system
- Notification system
- Payment automation infrastructure

### 🔄 Requires Enhancement
- Portal service (MXNB balance & transfer methods)
- Juno service (MXNB mint/redeem methods)
- Database schema (new tables)
- Frontend wallet components

---

## 🎯 Success Metrics

### Performance Targets
- **Deposit Processing**: < 5 minutes from MXN receipt to MXNB credit
- **Withdrawal Processing**: < 10 minutes from initiation to MXN payout
- **System Uptime**: 99.9% availability
- **Transaction Success Rate**: > 99.5%

### User Experience Goals
- **Seamless Integration**: No complex crypto knowledge required
- **Real-time Updates**: Live status tracking for all transactions
- **Transparent Fees**: Clear fee structure and calculations
- **Reliable Service**: Consistent and predictable processing times

This comprehensive system will provide users with a complete MXNB ecosystem, enabling seamless conversion between traditional MXN and blockchain-based MXNB tokens while maintaining the security and reliability expected from a financial platform.
