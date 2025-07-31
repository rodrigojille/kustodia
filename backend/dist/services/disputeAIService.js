"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputeAIService = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Dispute_1 = require("../entity/Dispute");
const User_1 = require("../entity/User");
const Payment_1 = require("../entity/Payment");
const openai_1 = __importDefault(require("openai"));
// Nebius AI client (compatible with OpenAI API)
const openai = new openai_1.default({
    apiKey: process.env.NEBIUS_API_KEY,
    baseURL: 'https://api.studio.nebius.com/v1',
});
console.log('Nebius API Key status:', process.env.NEBIUS_API_KEY ? 'Set' : 'Missing');
class DisputeAIService {
    /**
     * Analyze a dispute using Nebius AI-powered risk assessment
     */
    async analyzeDispute(disputeId) {
        try {
            // Check if Nebius API is available
            if (!process.env.NEBIUS_API_KEY) {
                console.warn('NEBIUS_API_KEY not set, falling back to rule-based assessment');
                return this.fallbackRiskAssessment(disputeId);
            }
            const disputeRepo = ormconfig_1.default.getRepository(Dispute_1.Dispute);
            const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
            const userRepo = ormconfig_1.default.getRepository(User_1.User);
            // Fetch dispute with essential context only
            const dispute = await disputeRepo.findOne({
                where: { id: disputeId },
                relations: ['escrow', 'escrow.payment', 'raisedBy'],
                select: {
                    id: true,
                    reason: true,
                    details: true,
                    evidence_url: true,
                    status: true,
                    created_at: true,
                    escrow: {
                        id: true,
                        custody_amount: true,
                        release_amount: true,
                        status: true,
                        dispute_status: true,
                        custody_end: true,
                        payment: {
                            id: true
                        }
                    },
                    raisedBy: {
                        id: true,
                        email: true,
                        full_name: true,
                        kyc_status: true,
                        created_at: true
                    }
                }
            });
            if (!dispute) {
                throw new Error('Dispute not found');
            }
            // Get payment ID from escrow relation
            const paymentId = dispute.escrow.payment?.id;
            if (!paymentId) {
                throw new Error('Payment not found for dispute');
            }
            // Fetch payment data separately with only needed fields
            const payment = await paymentRepo.findOne({
                where: { id: paymentId },
                select: {
                    id: true,
                    amount: true,
                    currency: true,
                    description: true,
                    status: true,
                    payment_type: true,
                    vertical_type: true,
                    operation_type: true,
                    created_at: true,
                    payer_email: true,
                    recipient_email: true
                }
            });
            if (!payment) {
                throw new Error('Payment not found');
            }
            const user = dispute.raisedBy;
            // Get user's dispute history
            const userDisputeHistory = await disputeRepo.count({
                where: { raisedBy: { id: user.id } }
            });
            // Get user's payment history
            const userPaymentHistory = await paymentRepo.count({
                where: { user: { id: user.id } }
            });
            // Create comprehensive data summary for AI analysis
            const disputeContext = {
                dispute: {
                    id: dispute.id,
                    reason: dispute.reason,
                    details: dispute.details,
                    evidenceProvided: !!dispute.evidence_url,
                    status: dispute.status,
                    created_at: dispute.created_at
                },
                payment: {
                    amount: payment.amount,
                    status: payment.status,
                    created_at: payment.created_at,
                    currency: 'MXN'
                },
                user: {
                    accountAge: user.created_at ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
                    kycStatus: user.kyc_status,
                    role: user.role,
                    totalDisputes: userDisputeHistory,
                    totalPayments: userPaymentHistory,
                    disputeFrequency: userPaymentHistory > 0 ? (userDisputeHistory / userPaymentHistory) * 100 : 0
                }
            };
            // Call Nebius AI for dispute risk assessment
            const aiResponse = await this.callNebiusAI(disputeContext);
            return aiResponse;
        }
        catch (error) {
            console.error('Error in AI dispute analysis:', error);
            // Fallback to rule-based assessment on AI failure
            return this.fallbackRiskAssessment(disputeId);
        }
    }
    /**
     * Call Nebius AI model for dispute risk assessment
     */
    async callNebiusAI(disputeContext) {
        try {
            const prompt = `
You are an expert AI system for analyzing payment disputes in a financial platform. Analyze the following dispute data and provide a comprehensive risk assessment.

DISPUTE DATA:
${JSON.stringify(disputeContext, null, 2)}

Please analyze this dispute and provide your assessment in the following JSON format:
{
  "riskScore": <number 0-100>,
  "recommendation": "<approve|reject|investigate>",
  "confidence": <number 0-100>,
  "riskFactors": [
    {
      "factor": "<factor name>",
      "impact": "<high|medium|low>",
      "scoreContribution": <positive or negative number>,
      "description": "<detailed explanation>"
    }
  ],
  "summary": "<brief risk assessment summary>",
  "actionRecommendations": ["<specific action 1>", "<specific action 2>"]
}

ANALYSIS GUIDELINES:
- Risk Score: 0-30 = Low Risk, 31-70 = Medium Risk, 71-100 = High Risk
- Consider: dispute frequency, account age, KYC status, evidence quality, payment amount, dispute timing
- Recommendation: approve (favor buyer), reject (favor seller), investigate (needs manual review)
- Confidence: How certain you are of your assessment based on available data
- Focus on fraud detection, pattern recognition, and evidence evaluation

Respond ONLY with valid JSON, no additional text.`;
            const completion = await openai.chat.completions.create({
                model: 'meta-llama/Llama-3.3-70B-Instruct-LoRa:kustodia-expert-v5-ZrCs', // Kustodia custom model v5
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert financial dispute analyst. Respond only with valid JSON containing your risk assessment.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.1, // Low temperature for consistent analysis
            });
            const aiContent = completion.choices[0]?.message?.content;
            if (!aiContent) {
                throw new Error('No response from AI model');
            }
            // Parse AI response - handle markdown code blocks
            let jsonContent = aiContent.trim();
            // Remove markdown code block markers if present
            if (jsonContent.startsWith('```json')) {
                jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            }
            else if (jsonContent.startsWith('```')) {
                jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            const aiAssessment = JSON.parse(jsonContent);
            // Validate the response structure
            if (!this.validateAIResponse(aiAssessment)) {
                throw new Error('Invalid AI response format');
            }
            return aiAssessment;
        }
        catch (error) {
            console.error('Nebius AI call failed:', error);
            throw error;
        }
    }
    /**
     * Validate AI response format
     */
    validateAIResponse(response) {
        const required = ['riskScore', 'recommendation', 'confidence', 'riskFactors', 'summary', 'actionRecommendations'];
        return required.every(field => field in response) &&
            typeof response.riskScore === 'number' &&
            typeof response.confidence === 'number' &&
            Array.isArray(response.riskFactors) &&
            Array.isArray(response.actionRecommendations) &&
            ['approve', 'reject', 'investigate'].includes(response.recommendation);
    }
    /**
     * Fallback rule-based assessment when AI is unavailable
     */
    async fallbackRiskAssessment(disputeId) {
        const disputeRepo = ormconfig_1.default.getRepository(Dispute_1.Dispute);
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const dispute = await disputeRepo.findOne({
            where: { id: disputeId },
            relations: ['escrow', 'escrow.payment', 'raisedBy']
        });
        if (!dispute) {
            throw new Error('Dispute not found');
        }
        const payment = dispute.escrow.payment;
        const user = dispute.raisedBy;
        // Simple rule-based risk assessment
        let riskScore = 30; // Base risk score
        const riskFactors = [];
        // High value transaction
        if (payment.amount > 10000) {
            riskScore += 15;
            riskFactors.push({
                factor: 'High Value Transaction',
                impact: 'medium',
                scoreContribution: 15,
                description: `Large payment amount of $${payment.amount}`
            });
        }
        // New account
        const accountAge = user.created_at ?
            (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24) : 0;
        if (accountAge < 30) {
            riskScore += 20;
            riskFactors.push({
                factor: 'New Account',
                impact: 'high',
                scoreContribution: 20,
                description: `Account created ${Math.floor(accountAge)} days ago`
            });
        }
        // KYC status
        if (user.kyc_status !== 'approved') {
            riskScore += 25;
            riskFactors.push({
                factor: 'Incomplete KYC',
                impact: 'high',
                scoreContribution: 25,
                description: `User KYC status is ${user.kyc_status}`
            });
        }
        // No evidence
        if (!dispute.evidence_url) {
            riskScore += 10;
            riskFactors.push({
                factor: 'No Evidence',
                impact: 'medium',
                scoreContribution: 10,
                description: 'No supporting evidence provided'
            });
        }
        // Determine recommendation
        let recommendation;
        if (riskScore <= 40) {
            recommendation = 'approve';
        }
        else if (riskScore >= 70) {
            recommendation = 'investigate';
        }
        else {
            recommendation = 'investigate';
        }
        return {
            riskScore: Math.min(100, riskScore),
            recommendation,
            confidence: 65, // Lower confidence for rule-based
            riskFactors,
            summary: `Rule-based assessment: ${riskScore <= 40 ? 'Low' : riskScore >= 70 ? 'High' : 'Medium'} risk dispute`,
            actionRecommendations: [
                riskScore >= 70 ? 'Manual review required' : 'Standard processing',
                'Review evidence and user history'
            ]
        };
    }
    /**
     * Batch analyze multiple disputes
     */
    async batchAnalyzeDisputes(disputeIds) {
        const results = {};
        // Process disputes in parallel with rate limiting
        const batchSize = 5; // Limit concurrent AI calls
        for (let i = 0; i < disputeIds.length; i += batchSize) {
            const batch = disputeIds.slice(i, i + batchSize);
            const batchPromises = batch.map(id => this.analyzeDispute(id).then(result => ({ id, result })).catch(error => ({ id, error })));
            const batchResults = await Promise.all(batchPromises);
            for (const item of batchResults) {
                if ('error' in item) {
                    console.error(`Failed to analyze dispute ${item.id}:`, item.error);
                    // Provide minimal fallback assessment
                    results[item.id] = {
                        riskScore: 50,
                        recommendation: 'investigate',
                        confidence: 30,
                        riskFactors: [],
                        summary: 'Analysis failed, manual review required',
                        actionRecommendations: ['Manual review required due to analysis error']
                    };
                }
                else {
                    results[item.id] = item.result;
                }
            }
        }
        return results;
    }
}
exports.DisputeAIService = DisputeAIService;
