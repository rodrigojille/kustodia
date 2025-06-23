require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);
const { Client } = require('pg');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
// Portal SDK is NOT compatible with Node.js backend. Only use the Portal API to create wallets and save the share.
// The EVM address will be derived by the frontend on next login using the Portal SDK, and sent to the backend.

// Hardcoded per-user API key for rodrigo.jimenez@crehana.com
const PORTAL_API_KEY = '1538d98c-b823-4ab8-ab6d-17774a393870';
const DATABASE_URL = process.env.DATABASE_URL;
console.log('Using PORTAL_API_KEY:', PORTAL_API_KEY);

async function migrateSingleUser(targetEmail, targetId) {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  // Use provided user id and email
  const user = { id: targetId, email: targetEmail };
  // Check if portal_share already exists
  const res = await client.query('SELECT portal_share FROM "user" WHERE id = $1', [targetId]);
  if (res.rows.length > 0 && res.rows[0].portal_share) {
    console.log(`User ${user.email} already has a portal_share. Skipping.`);
    await client.end();
    return;
  }
  try {
      // 1. Create wallet via Portal API
      const portalRes = await fetch('https://mpc-client.portalhq.io/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PORTAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: '{}'
      });

      if (!portalRes.ok) {
        const errorText = await portalRes.text();
        console.error(`Failed to create wallet for user ${user.email}: ${portalRes.status} ${portalRes.statusText} - ${errorText}`);
        // If BAD_REQUEST, try to fetch wallet details
        if (errorText.includes('BAD_REQUEST') || errorText.includes('already')) {
          console.log(`Attempting to fetch existing wallet details for user ${user.email}...`);
          const detailsRes = await fetch('https://api.portalhq.io/api/v3/clients/me', {
            headers: { 'Authorization': `Bearer ${PORTAL_API_KEY}` }
          });
          if (!detailsRes.ok) {
            const errText = await detailsRes.text();
            console.error(`Failed to fetch wallet address for user ${user.email}: ${detailsRes.status} ${detailsRes.statusText} - ${errText}`);
          } else {
            const details = await detailsRes.json();
            const evmAddress = details?.metadata?.namespaces?.eip155?.address;
            if (evmAddress) {
              await client.query(
                'UPDATE "user" SET wallet_address = $1 WHERE id = $2',
                [evmAddress, user.id]
              );
              console.log(`User ${user.email}: wallet_address=${evmAddress} (fetched)`);
            } else {
              console.error(`No EVM address found for user ${user.email}`);
            }
          }
        }
        await client.end();
        return;
      }

      const portalData = await portalRes.json();
      const secpShare = portalData.SECP256K1?.share;
      const secpId = portalData.SECP256K1?.id;
      const edShare = portalData.ED25519?.share;
      const edId = portalData.ED25519?.id;

      // 2. Store both shares and IDs in DB (extend as needed)
      await client.query(
        'UPDATE "user" SET portal_share = $1 WHERE id = $2',
        [secpShare, user.id]
      );
      console.log(`User ${user.email}: portal_share=${secpShare}`);

      // 3. Confirm share storage with PATCH
      const confirmRes = await fetch('https://api.portalhq.io/api/v3/clients/me/signing-share-pairs', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${PORTAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'STORED_CLIENT',
          signingSharePairIds: [secpId, edId].filter(Boolean)
        })
      });
      if (!confirmRes.ok) {
        const errText = await confirmRes.text();
        console.error(`Failed to confirm share storage for user ${user.email}: ${confirmRes.status} ${confirmRes.statusText} - ${errText}`);
      }

      // 4. Fetch wallet address
      const detailsRes = await fetch('https://api.portalhq.io/api/v3/clients/me', {
        headers: { 'Authorization': `Bearer ${PORTAL_API_KEY}` }
      });
      if (!detailsRes.ok) {
        const errText = await detailsRes.text();
        console.error(`Failed to fetch wallet address for user ${user.email}: ${detailsRes.status} ${detailsRes.statusText} - ${errText}`);
      } else {
        const details = await detailsRes.json();
        const evmAddress = details?.metadata?.namespaces?.eip155?.address;
        if (evmAddress) {
          await client.query(
            'UPDATE "user" SET wallet_address = $1 WHERE id = $2',
            [evmAddress, user.id]
          );
          console.log(`User ${user.email}: wallet_address=${evmAddress}`);
        } else {
          console.error(`No EVM address found for user ${user.email}`);
        }
      }
  } catch (err) {
    console.error(`Error processing user ${user.email}:`, err);
  }

  await client.end();
  console.log('Migration complete!');
}

// Directly migrate rodrigo.jimenez@crehana.com with user id 4
migrateSingleUser('rodrigo.jimenez@crehana.com', 4).catch(console.error);