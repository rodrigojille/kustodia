const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

// Replace with the API key for this client/wallet
const PORTAL_API_KEY = '9f2f1e04-405f-4461-a2f3-45a012cddeaf';
const WALLET_ADDRESS = '0x55fcb19cac32059c9a04172c23ffc6444db49cd6';
const CLIENT_ID = 'cmbvqjpgm03m411ew4eymn0vv';
const WALLET_ID = 'cmbvqjpgm03m411ew4eymn0vv'; // Portal wallet ID

async function fetchByAddressGeneric() {
  const url = `https://mpc-client.portalhq.io/v1/wallets?address=${WALLET_ADDRESS}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${PORTAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    console.error('By address (generic) error:', await res.text());
    return null;
  }
  const data = await res.json();
  console.log('By address (generic) result:', data);
  // If data is an array, try to find the share
  if (Array.isArray(data)) {
    const wallet = data.find(w => w.address?.toLowerCase() === WALLET_ADDRESS.toLowerCase());
    return wallet?.share || wallet?.portalShare;
  }
  return data.share || data.portalShare;
}

async function fetchByClientIdGeneric() {
  const url = `https://mpc-client.portalhq.io/v1/wallets?clientId=${CLIENT_ID}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${PORTAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    console.error('By client ID (generic) error:', await res.text());
    return null;
  }
  const data = await res.json();
  console.log('By client ID (generic) result:', data);
  if (Array.isArray(data)) {
    const wallet = data[0];
    return wallet?.share || wallet?.portalShare;
  }
  return data.share || data.portalShare;
}

// Fetch encrypted client backup share for Portal-Managed Backups (v3 endpoint)
async function fetchEncryptedClientBackupShare() {
  const url = `https://api.portalhq.io/api/v3/clients/me/wallets/${WALLET_ID}/ejectable-backup-shares`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${PORTAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    console.error('Encrypted client backup share error:', await res.text());
    return null;
  }
  const data = await res.json();
  console.log('Encrypted client backup share result:', data);
  return data.encryptedClientBackupShare;
}


(async () => {
  console.log('--- Fetching by address (generic) ---');
  const shareByAddressGeneric = await fetchByAddressGeneric();
  if (shareByAddressGeneric) {
    console.log('Portal share (by address, generic):', shareByAddressGeneric);
  } else {
    console.log('No portal share found by address (generic).');
  }

  console.log('--- Fetching by client ID (generic) ---');
  const shareByClientIdGeneric = await fetchByClientIdGeneric();
  if (shareByClientIdGeneric) {
    console.log('Portal share (by client ID, generic):', shareByClientIdGeneric);
  } else {
    console.log('No portal share found by client ID (generic).');
  }
  console.log('--- Fetching encrypted client backup share (v3 endpoint) ---');
  const encryptedShare = await fetchEncryptedClientBackupShare();
  if (encryptedShare) {
    console.log('Encrypted client backup share:', encryptedShare);
  } else {
    console.log('No encrypted client backup share found.');
  }
})();
