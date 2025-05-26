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
    if (!TRUORA_API_KEY) {
      res.status(500).json({ error: "Truora API key not configured" });
      return;
    }
    // Construye la URL de KYC para Truora
    const kycUrl = `https://identity.truora.com/?token=${TRUORA_API_KEY}`;
    res.json({ url: kycUrl });
  } catch (err: any) {
    console.error("Truora startKYC error:", err.message || err);
    res.status(500).json({ error: "Failed to generate Truora KYC URL", details: err.message || err });
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
