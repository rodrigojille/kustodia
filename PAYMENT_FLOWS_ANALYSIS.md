# Kustodia Payment Flow Analysis

## Overview
Kustodia supports 3 distinct payment flows that serve different use cases:

## Flow 1: Request Payment (Cobro)
**Use Case**: Seller requests payment from buyer  
**Frontend**: `/pagos/nuevo` → "Cobro" tab  
**Backend**: `POST /api/payments` → `requestPaymentController`

### Process:
1. Seller creates payment request with buyer's email
2. System creates Payment record with status "requested"
3. Email notification sent to buyer and seller
4. Buyer must login and accept/fund the payment
5. Payment transitions to "funded" → "paid"

### Key Features:
- Email-based workflow
- Requires both parties to be registered users
- Commission support for marketplaces
- Travel rule compliance data

## Flow 2: Direct Payment (Pago)
**Use Case**: Buyer initiates payment directly  
**Frontend**: `/pagos/nuevo` → "Pago" tab  
**Backend**: `POST /api/payments/initiate` → `paymentController`

### Process:
1. Buyer initiates payment to recipient email
2. System generates unique CLABE via Juno API
3. Creates Payment (status "pending") + Escrow records
4. Buyer transfers funds to generated CLABE
5. Juno webhook detects deposit → status "funded"
6. System processes escrow/custody logic

### Key Features:
- Traditional banking integration (CLABE/SPEI)
- Automatic CLABE generation
- Escrow/custody functionality
- No blockchain required

## Flow 3: Wallet-Based Escrow (Flow 2.0)
**Use Case**: Modern crypto-native escrow payments  
**Frontend**: `/dashboard/flow2` or `/dashboard/nuevo-flujo`  
**Backend**: `POST /api/payments/preflight-wallet` + `POST /api/payments/initiate-wallet`

### Process:
1. Frontend calls preflight endpoint for contract info
2. User signs blockchain transaction via wallet (MetaMask)
3. Smart contract creates on-chain escrow
4. Backend syncs blockchain events
5. Escrow released based on smart contract conditions

### Key Features:
- MXNB token (Mexican Peso stablecoin)
- Arbitrum Sepolia testnet
- Smart contract automation
- Decentralized dispute resolution
- Portal wallet integration

## Technical Stack

### Frontend (Next.js)
- `/pagos/nuevo` - Payment creation UI
- `/dashboard/page.tsx` - Main dashboard
- `/dashboard/flow2` - Wallet-based flow
- Components: PaymentsTable, PaymentsByMonthChart, etc.

### Backend (Express + TypeORM)
- Database entities: Payment, Escrow, User, PaymentEvent
- Multiple controllers for different flows
- Juno API integration for traditional banking
- Ethereum integration for smart contracts

### Smart Contracts (Arbitrum Sepolia)
- Escrow contract: `ESCROW3_CONTRACT_ADDRESS`
- MXNB token: `MXNB_CONTRACT_ADDRESS`
- Events: EscrowCreated, EscrowReleased, etc.

## Current Status
- All three flows are implemented and coexist
- Frontend has recent fintech UI enhancements
- CORS configuration updated for local development
- Smart contract integration is functional

## Next Steps for Understanding
1. Test each payment flow in the browser
2. Examine the database schema
3. Review smart contract interactions
4. Understand the webhook/event systems
5. Analyze the user authentication flow
