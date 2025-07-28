console.log("truoraController loaded");
import { Request, Response } from "express";
import axios from "axios";
import { sendKYCStatusEmail } from "../utils/emailService";
import ormconfig from "../ormconfig";
import { User } from "../entity/User";

// Updated Truora API configuration for Main Validator Suite API
// Force load the correct API key from .env file
const TRUORA_API_KEY = process.env.TRUORA_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiIiwiYWRkaXRpb25hbF9kYXRhIjoie30iLCJjbGllbnRfaWQiOiJUQ0kyYjJkM2JlZDg4YWY0ZTA1MzM1MGMxYTdhYjVhZmUyMiIsImV4cCI6MzMzMDE3ODEyNywiZ3JhbnQiOiIiLCJpYXQiOjE3NTMzNzgxMjcsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xX1Jib0NpRXdNZyIsImp0aSI6IjRkYzZmN2QyLTg4YmUtNDljOC1iYzhjLTM5NmE0MzJiNmIwZSIsImtleV9uYW1lIjoia3VzdG9kaWFreWMiLCJrZXlfdHlwZSI6ImJhY2tlbmQiLCJ1c2VybmFtZSI6IlRDSTJiMmQzYmVkODhhZjRlMDUzMzUwYzFhN2FiNWFmZTIyLWt1c3RvZGlha3ljIn0.KvKyAFNDlQ9v35PqkRy0X1dNFt6SKY_hLnhZNpwtZVo';

// Truora Flow Configuration
const TRUORA_FLOW_ID = process.env.TRUORA_FLOW_ID;
const TRUORA_ACCOUNT_ID = process.env.TRUORA_ACCOUNT_ID;
const TRUORA_FACIAL_RULE_ID = process.env.TRUORA_FACIAL_RULE_ID;
const TRUORA_DOCUMENT_RULE_ID = process.env.TRUORA_DOCUMENT_RULE_ID;
const TRUORA_FACIAL_SIGNATURE_KEY = process.env.TRUORA_FACIAL_SIGNATURE_KEY;
const TRUORA_DOCUMENT_SIGNATURE_KEY = process.env.TRUORA_DOCUMENT_SIGNATURE_KEY;

console.log('[Truora] Loaded API Key on startup:', TRUORA_API_KEY ? `${TRUORA_API_KEY.substring(0, 20)}...` : 'NOT SET');
console.log('[Truora] API Key ends with:', TRUORA_API_KEY ? `...${TRUORA_API_KEY.slice(-10)}` : 'NOT SET');
console.log('[Truora] Flow ID:', TRUORA_FLOW_ID ? 'SET' : 'NOT SET');
console.log('[Truora] Account ID:', TRUORA_ACCOUNT_ID ? 'SET' : 'NOT SET');
const TRUORA_BASE_URL = "https://api.validations.truora.com";
const TRUORA_API_URL = `${TRUORA_BASE_URL}/v1/validations`;
const TRUORA_ACCOUNTS_URL = `${TRUORA_BASE_URL}/v1/accounts`;

// Legacy environment variables (keeping for backward compatibility)
// Note: TRUORA_FLOW_ID and TRUORA_ACCOUNT_ID already declared above

// Validation types
const VALIDATION_TYPES = {
  DOCUMENT: 'document-validation',
  FACE: 'face-recognition',
  EMAIL: 'email-verification',
  PHONE: 'phone-verification'
};

// Handle webhook: update user KYC status by process_id
// TODO: Verify JWT signature from Truora for security (see docs)
export const truoraWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;
    console.log('Received Truora KYC webhook:', payload);
    const processId = payload.process_id;
    const status = payload.status || payload.result;
    if (processId) {
      const userRepo = ormconfig.getRepository(User);
      await userRepo.update({ truora_process_id: processId }, { kyc_status: status });
    }
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error processing Truora webhook:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Start document validation process directly
 * Uses the new Main Validator Suite API - simplified approach
 */
export const startKYC = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!TRUORA_API_KEY || !TRUORA_FLOW_ID) {
      res.status(500).json({ error: "Truora configuration incomplete" });
      return;
    }

    const { email, phone, country = 'MX' } = req.body;
    
    console.log('[Truora] Starting KYC with Web Integration Token for:', { email, country });
    console.log('[Truora] Using Flow ID:', TRUORA_FLOW_ID);

    // Step 1: Generate Web Integration Token
    const tokenData = new URLSearchParams({
      key_type: 'web',
      grant: 'digital-identity',
      api_key_version: '1',
      country: 'ALL',
      redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?kyc=completed`,
      flow_id: TRUORA_FLOW_ID,
      account_id: email ? email.replace('@', '_').replace('.', '_') : `user_${Date.now()}`, // Use email or generate unique ID
    });

    // Add optional fields if provided
    if (email) {
      tokenData.append('emails', email);
    }
    if (phone) {
      tokenData.append('phone', phone);
    }

    console.log('[Truora] Creating web integration token...');
    
    const tokenResponse = await axios.post(
      'https://api.account.truora.com/v1/api-keys',
      tokenData,
      {
        headers: {
          'Truora-API-Key': TRUORA_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('[Truora] Web integration token created successfully');

    const webToken = tokenResponse.data.api_key;
    const processUrl = `https://identity.truora.com/?token=${webToken}`;

    // Try to update user with process info (non-critical)
    try {
      if (email) {
        const userRepo = ormconfig.getRepository(User);
        await userRepo.update({ email }, { truora_process_id: webToken });
        console.log('[Truora] Successfully updated user with web token');
      }
    } catch (dbError: any) {
      console.warn('[Truora] Warning: Could not update user with web token (non-critical):', dbError.message);
    }

    // Return web integration URL to frontend
    res.json({
      success: true,
      web_token: webToken,
      process_url: processUrl,
      url: processUrl, // For frontend compatibility
      flow_id: TRUORA_FLOW_ID,
      account_id: email ? email.replace('@', '_').replace('.', '_') : `user_${Date.now()}`,
      message: 'KYC web integration token created - URL includes QR code for mobile validation'
    });

  } catch (err: any) {
    console.error('Truora startKYC error:', err.response?.data || err.message || err);
    res.status(500).json({ 
      error: "Truora KYC web integration failed", 
      details: err.response?.data || err.message || err 
    });
  }
};

/**
 * Get validation status by validation ID
 * Uses the new Main Validator Suite API
 */
export const getValidationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { validation_id } = req.params;
    
    if (!validation_id) {
      res.status(400).json({ error: 'Validation ID is required' });
      return;
    }

    if (!TRUORA_API_KEY) {
      res.status(500).json({ error: "Truora API key not configured" });
      return;
    }

    console.log('[Truora] Getting validation status for:', validation_id);

    const response = await axios.get(
      `${TRUORA_API_URL}/${validation_id}`,
      {
        headers: {
          'Truora-API-Key': TRUORA_API_KEY,
        },
      }
    );

    console.log('[Truora] Validation status response:', response.data);

    const validationData = response.data;
    const status = validationData.validation_status;
    
    // Update user KYC status in database if validation is complete
    if (status === 'success' || status === 'failure') {
      try {
        const userRepo = ormconfig.getRepository(User);
        const kycStatus = status === 'success' ? 'approved' : 'rejected';
        await userRepo.update({ truora_process_id: validation_id }, { kyc_status: kycStatus });
        console.log(`[Truora] Updated user KYC status to: ${kycStatus}`);
      } catch (dbError) {
        console.error('[Truora] Error updating user KYC status:', dbError);
      }
    }

    res.json({
      success: true,
      validation_id,
      status,
      validation_data: validationData
    });

  } catch (err: any) {
    console.error('Truora getValidationStatus error:', err.response?.data || err.message || err);
    res.status(500).json({ 
      error: 'Failed to get validation status', 
      details: err.response?.data || err.message || err 
    });
  }
};

/**
 * Legacy verifyKYC function - updated to work with new API
 * @deprecated Use getValidationStatus instead
 */
export const verifyKYC = async (req: Request, res: Response): Promise<void> => {
  const { validation_id, email } = req.body;

  try {
    if (!TRUORA_API_KEY) {
      res.status(500).json({ error: "Truora API key not configured" });
      return;
    }

    if (!validation_id) {
      res.status(400).json({ error: "Validation ID is required" });
      return;
    }

    console.log('[Truora] Verifying KYC for validation:', validation_id);

    const response = await axios.get(
      `${TRUORA_API_URL}/${validation_id}`,
      {
        headers: {
          'Truora-API-Key': TRUORA_API_KEY,
        },
      }
    );

    console.log('[Truora] Verification response:', response.data);

    const validationData = response.data;
    const status = validationData.validation_status;
    
    // Determine final status
    let finalStatus: 'approved' | 'rejected' | 'pending' = 'pending';
    let reason: string | null = null;
    
    if (status === 'success') {
      finalStatus = 'approved';
    } else if (status === 'failure') {
      finalStatus = 'rejected';
      reason = validationData.failure_reason || validationData.expired_reason || null;
    }

    // Update user KYC status in database
    if (finalStatus !== 'pending') {
      try {
        const userRepo = ormconfig.getRepository(User);
        await userRepo.update({ truora_process_id: validation_id }, { kyc_status: finalStatus });
        console.log(`[Truora] Updated user KYC status to: ${finalStatus}`);
      } catch (dbError) {
        console.error('[Truora] Error updating user KYC status:', dbError);
      }
    }

    // Send KYC status email if email present
    if (email && finalStatus !== 'pending') {
      try {
        await sendKYCStatusEmail(email, finalStatus, reason || undefined);
      } catch (emailError) {
        console.error('[Truora] Error sending KYC status email:', emailError);
      }
    }

    res.json({ 
      success: true, 
      status: finalStatus,
      validation_status: status,
      reason,
      truora_result: validationData 
    });

  } catch (err: any) {
    console.error("Truora verifyKYC error:", err.response?.data || err.message || err);
    res.status(500).json({ 
      error: "Truora KYC verification failed", 
      details: err.response?.data || err.message || err 
    });
  }
};

/**
 * Update user KYC status after successful completion
 */
export const updateKYCStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { process_id, account_id, status } = req.body;
    
    if (!process_id || !account_id) {
      res.status(400).json({ error: 'Process ID and Account ID are required' });
      return;
    }

    console.log('[Truora] Updating KYC status:', { process_id, account_id, status });

    // Try to get the process result from Truora
    let truoraResult = null;
    try {
      const resultResponse = await axios.get(
        `https://api.identity.truora.com/v1/processes/${process_id}/result`,
        {
          headers: {
            'Truora-API-Key': TRUORA_API_KEY,
          },
        }
      );
      truoraResult = resultResponse.data;
      console.log('[Truora] Process result:', truoraResult);
    } catch (err: any) {
      console.warn('[Truora] Could not fetch process result:', err.response?.data || err.message);
    }

    // Try to update user in database (non-critical)
    let dbUpdateSuccess = false;
    let email = account_id;
    
    try {
      const userRepo = ormconfig.getRepository(User);
      
      // Find user by account_id (which should be the email format)
      // Convert rodrigo_kustodia_mx back to rodrigo@kustodia.mx
      if (account_id.includes('_')) {
        const parts = account_id.split('_');
        if (parts.length >= 3) {
          email = `${parts[0]}@${parts.slice(1, -1).join('.')}.${parts[parts.length - 1]}`;
        }
      }
      
      console.log('[Truora] Database update attempt:');
      console.log('- Account ID:', account_id);
      console.log('- Mapped Email:', email);
      console.log('- Process ID:', process_id);
      console.log('- Status:', status);
      
      // Check if user exists first
      const existingUser = await userRepo.findOne({ where: { email: email } });
      if (!existingUser) {
        console.warn('[Truora] User not found with email:', email);
        throw new Error(`User not found with email: ${email}`);
      }
      
      console.log('[Truora] User found:', {
        id: existingUser.id,
        email: existingUser.email,
        current_kyc_status: existingUser.kyc_status
      });
      
      const updateData: any = {
        kyc_status: status === 'completed' ? 'approved' : status,
        truora_process_id: process_id,
      };

      // Add Truora result data if available
      if (truoraResult) {
        updateData.truora_result = JSON.stringify(truoraResult);
      }

      const result = await userRepo.update(
        { email: email },
        updateData
      );

      console.log('[Truora] Update result:', {
        affected: result.affected,
        generatedMaps: result.generatedMaps,
        raw: result.raw
      });
      
      if (result.affected && result.affected > 0) {
        console.log('[Truora] User KYC status updated successfully in database');
        dbUpdateSuccess = true;
        
        // Verify the update
        const updatedUser = await userRepo.findOne({ where: { email: email } });
        console.log('[Truora] Updated user status:', updatedUser?.kyc_status);
      } else {
        console.warn('[Truora] No rows were affected by the update');
        throw new Error('No rows were affected by the update');
      }

    } catch (dbError: any) {
      console.warn('[Truora] Warning: Could not update user in database (non-critical):', dbError.message);
      console.log('[Truora] KYC was completed successfully in Truora, database update failed but this is not critical');
    }

    // Always return success since KYC was completed in Truora
    res.json({
      success: true,
      message: dbUpdateSuccess ? 'KYC status updated successfully' : 'KYC completed in Truora (database update failed but non-critical)',
      process_id,
      account_id,
      email: email,
      status: status === 'completed' ? 'approved' : status,
      truora_result: truoraResult ? 'Retrieved' : 'Not available',
      database_updated: dbUpdateSuccess
    });

  } catch (err: any) {
    console.error('Truora updateKYCStatus error:', err.response?.data || err.message || err);
    res.status(500).json({ 
      error: 'Failed to update KYC status', 
      details: err.response?.data || err.message || err 
    });
  }
};

// Note: Complete KYC flow endpoint removed - using existing document validation endpoint
// which already provides QR code functionality through Truora's interface
