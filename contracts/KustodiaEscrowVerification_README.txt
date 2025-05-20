# KustodiaEscrow Verification Instructions

This source file is reconstructed from the original build-info used for deployment. Use this file (with imports) for contract verification on Arbiscan or Sourcify.

## Steps:
1. Use the file `contracts/KustodiaEscrow.sol` as your main contract source (do not flatten).
2. Ensure your project includes the correct OpenZeppelin contracts as shown in the imports.
3. Set the following verification parameters:
   - Compiler version: v0.8.20+commit.a1b79de6
   - Optimization: No
   - Runs: 200
   - EVM Version: default (or "paris" if available)
   - Contract Name: KustodiaEscrow
   - Constructor Arguments (ABI-encoded, no 0x):
     000000000000000000000000357e635d1c28759d0b3e7c2201bc10d1ebc111f000000000000000000000000c09b02ddb3bbcc78fc47446d8d74e677ba8db3e8
4. Paste or upload all source files (including OpenZeppelin dependencies if required by the UI).

## Note
- The struct and event definitions must match exactly as in this file.
- If you need to reconstruct the full dependency tree, use the OpenZeppelin version that matches your original deployment.

---
This will ensure your contract matches the deployed bytecode and passes verification.
