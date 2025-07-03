/**
 * TypeScript declaration file for the JavaScript EtherFuseService.
 * This file provides type information to the TypeScript compiler,
 * enabling static analysis, autocompletion, and type safety when
 * this service is imported into TypeScript files.
 */
declare class EtherFuseService {
    constructor();

    /**
     * Generate a pre-signed URL for user onboarding.
     */
    generateOnboardingUrl(kustodiaCustomerId: string | number, kustodiaBankAccountId: string): Promise<{
        success: boolean;
        presignedUrl?: string;
        error?: string;
        code?: number;
        data?: any;
    }>;

    /**
     * Create a CETES investment order.
     */
    createCetesOrder(orderData: {
        customerId: string | number;
        amount: number;
        paymentId: string | number;
        period?: string;
    }): Promise<{
        success: boolean;
        order_id?: string;
        status?: string;
        error?: string;
        code?: number;
        data?: any;
    }>;

    /**
     * Verify a webhook signature for security.
     */
    verifyWebhookSignature(payload: string, signature: string): boolean;

    // Add other public methods as needed for full type coverage
    healthCheck(): Promise<any>;
    getCurrentRate(): Promise<any>;
    getOrderStatus(orderId: string): Promise<any>;
}

export = EtherFuseService;
