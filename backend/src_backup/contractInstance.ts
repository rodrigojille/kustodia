// This is a mock contract instance for backend testing. Replace with actual ethers.js contract instance in production.
export default {
  async raiseDispute(escrowId: string, options: { from: string }) {
    // Simulate async blockchain call
    return {
      hash: 'MOCK_TX_HASH',
      wait: async () => true
    };
  },
  async resolveDispute(escrowId: string, approve: boolean) {
    return {
      hash: 'MOCK_RESOLVE_TX_HASH',
      wait: async () => true
    };
  }
};
