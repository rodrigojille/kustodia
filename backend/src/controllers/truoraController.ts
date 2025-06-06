console.log("truoraController loaded");
import { Request, Response } from "express";
import axios from "axios";
import { sendKYCStatusEmail } from "../utils/emailService";
import { getRepository } from "typeorm";
import { User } from "../entity/User";

const TRUORA_API_KEY = process.env.TRUORA_API_KEY;
const TRUORA_API_URL = "https://api.truora.com/v1/identity_verifications";
const TRUORA_FLOW_ID = process.env.TRUORA_FLOW_ID;
const TRUORA_ACCOUNT_ID = process.env.TRUORA_ACCOUNT_ID || "TCI2b2d3bed88af4e053350c1a7ab5afe22";
const TRUORA_SESSION_URL = `https://api.identity.truora.com/v1/flows/${TRUORA_FLOW_ID}/web-init`;

const FACIAL_RULE_ID = process.env.TRUORA_FACIAL_RULE_ID!;
const DOCUMENT_RULE_ID = process.env.TRUORA_DOCUMENT_RULE_ID!;

// Handle webhook: update user KYC status by process_id
// TODO: Verify JWT signature from Truora for security (see docs)
export const truoraWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;
    console.log('Received Truora KYC webhook:', payload);
    const processId = payload.process_id;
    const status = payload.status || payload.result;
    if (processId) {
      const userRepo = getRepository(User);
      await userRepo.update({ truora_process_id: processId }, { kyc_status: status });
    }
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error processing Truora webhook:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

export const startKYC = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!TRUORA_API_KEY || !TRUORA_FLOW_ID || !TRUORA_ACCOUNT_ID) {
      res.status(500).json({ error: "Truora API key, flow ID, or account ID not configured" });
      return;
    }
    // Extract user info from request (customize as needed)
    const { email, phone, country = 'ALL', redirect_url } = req.body;
    // You may want to generate a unique account_id per user/session for traceability
    const userAccountId = req.body.account_id || TRUORA_ACCOUNT_ID;
    // Prepare params for Truora web integration token
    const params = new URLSearchParams();
    params.append('key_type', 'web');
    params.append('grant', 'digital-identity');
    params.append('api_key_version', '1');
    params.append('country', country);
    params.append('redirect_url', redirect_url || process.env.TRUORA_REDIRECT_URL || 'https://kustodia.mx/login');
    params.append('flow_id', TRUORA_FLOW_ID);
    params.append('account_id', userAccountId);
    if (email) params.append('emails', email);
    if (phone) params.append('phone', phone);
    // Optionally add more metadata as needed
    // params.append('start_variables.metadata.name', req.body.name || '');
    const response = await axios.post(
      'https://api.account.truora.com/v1/api-keys',
      params,
      {
        headers: {
          'Truora-API-Key': TRUORA_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    const apiKey = response.data?.api_key;
    if (!apiKey) {
      res.status(500).json({ error: 'Failed to obtain Truora web integration token', details: response.data });
      return;
    }
    // Optionally: store process_id (apiKey) in DB for tracking
    // const userRepo = getRepository(User);
    // await userRepo.update({ id: req.user.id }, { truora_process_id: apiKey });
    const kycUrl = `https://identity.truora.com/?token=${apiKey}`;
    res.json({ url: kycUrl });
  } catch (err: any) {
    console.error('Truora startKYC error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to generate Truora KYC URL', details: err.response?.data || err.message || err });
  }
};

export const verifyKYC = async (req: Request, res: Response): Promise<void> => {
  const { type, document_data, facial_data, phone_data } = req.body;
  let payload: any = {};
  let rule_id = "";

  try {
    if (!TRUORA_API_KEY) {
      res.status(500).json({ error: "Truora API key not configured" });
      return;
    }

    if (type === "document") {
      rule_id = DOCUMENT_RULE_ID;
      payload = {
        rule_id,
        ...document_data, // expected: { country, document_number, document_type, etc. }
      };
    } else if (type === "facial") {
      rule_id = FACIAL_RULE_ID;
      payload = {
        rule_id,
        ...facial_data, // expected: { country, document_number, selfie_image, document_image, etc. }
      };
    } else if (type === "phone") {
      // Truora phone verification (if needed)
      payload = {
        ...phone_data, // expected: { country, phone_number }
      };
    } else {
      res.status(400).json({ error: "Invalid KYC type" });
      return;
    }

    const response = await axios.post(TRUORA_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TRUORA_API_KEY}`,
      },
    });

    // Determine status from Truora response (simplified, adjust as needed)
    let status: 'approved' | 'rejected' | 'pending' = 'pending';
    let reason: string | undefined = undefined;
    if (response.data?.status === 'approved' || response.data?.result === 'approved') {
      status = 'approved';
    } else if (response.data?.status === 'rejected' || response.data?.result === 'rejected') {
      status = 'rejected';
      reason = response.data?.reason || response.data?.details;
    }
    // Send KYC status email if email present
    if (req.body.email) {
      await sendKYCStatusEmail(req.body.email, status, reason);
    }
    res.json({ success: true, truora_result: response.data });
  } catch (err: any) {
    console.error("Truora KYC error:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Truora KYC verification failed", details: err.response?.data || err.message || err });
  }
};
