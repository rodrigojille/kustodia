"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This is a mock contract instance for backend testing. Replace with actual ethers.js contract instance in production.
exports.default = {
    async raiseDispute(escrowId, options) {
        // Simulate async blockchain call
        return {
            hash: 'MOCK_TX_HASH',
            wait: async () => true
        };
    },
    async resolveDispute(escrowId, approve) {
        return {
            hash: 'MOCK_RESOLVE_TX_HASH',
            wait: async () => true
        };
    }
};
