import { Router, RequestHandler } from 'express';
import { authenticateJWT } from '../authenticateJWT';
import { User } from '../entity/User';
import AppDataSource from '../ormconfig';
import axios from 'axios';

const router = Router();

interface PortalTransactionRequest {
  to: string;
  data: string;
  amount?: string;
  description: string;
}

router.post('/send-transaction', authenticateJWT, async (req, res): Promise<void> => {
  try {
    const { to, data, amount, description } = req.body as PortalTransactionRequest;
    const userId = (req as any).userId;

    // Get user from database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!user.wallet_address) {
      res.status(400).json({ error: 'User has no wallet address' });
      return;
    }

    // Check if user has portal_share (required for Portal Enclave API)
    if (!user.portal_share) {
      res.status(400).json({ error: 'User has no Portal signing share. Please create a wallet first.' });
      return;
    }

    // Get user's signing share from database
    const signingShare = user.portal_share;

    if (!signingShare) {
      res.status(400).json({ error: 'User signing share not found' });
      return;
    }

    console.log('🚀 [Portal Payment] Sending transaction via Portal Enclave API...');

    // Send transaction using Portal Enclave API (same method as successful web3Payment)
    const transactionResponse = await axios.post(
      'https://mpc-client.portalhq.io/v1/sign',
      {
        share: signingShare,
        method: 'eth_sendTransaction',
        params: JSON.stringify({
          to,
          data,
          value: amount || '0x0'
        }),
        chainId: 'eip155:421614',
        rpcUrl: 'https://api.portalhq.io/rpc/v1/eip155/421614'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PORTAL_CUSTODIAN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Log the full Portal API response to understand structure
    console.log('✅ [Portal Payment] Portal API Response:', {
      status: transactionResponse.status,
      data: transactionResponse.data,
      dataType: typeof transactionResponse.data,
      dataKeys: Object.keys(transactionResponse.data || {})
    });

    // Extract transaction hash from response - Portal API returns it in data.data field
    const txHash = transactionResponse.data?.data || transactionResponse.data?.hash || transactionResponse.data?.result || transactionResponse.data;
    
    console.log('✅ [Portal Payment] Transaction sent successfully:', {
      hash: txHash,
      to,
      description
    });

    res.json({
      success: true,
      transactionHash: txHash,
      data: transactionResponse.data
    });

  } catch (error: any) {
    console.error('❌ [Portal Payment] Transaction failed:', error);
    
    // Log the actual error response from Portal API
    if (error?.response) {
      console.error('Portal API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    if (axios.isAxiosError(error)) {
      console.error('Portal API Error:', error.response?.data);
      res.status(500).json({
        error: 'Portal transaction failed',
        details: error.response?.data?.message || error.message,
        portalError: error.response?.data
      });
      return;
    }

    res.status(500).json({
      error: 'Transaction failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      portalError: error?.response?.data
    });
  }
});

export default router;
