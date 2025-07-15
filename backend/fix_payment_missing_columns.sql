-- Fix Missing Payment Columns
-- Generated on 2025-07-15T00:29:44.481Z

-- Update payment 1 with missing columns
UPDATE payment SET
  description = 'Test payment'
WHERE id = 1;

-- Update payment 2 with missing columns
UPDATE payment SET
  description = 'Test payment'
WHERE id = 2;

-- Update payment 3 with missing columns
UPDATE payment SET
  description = 'Test payment'
WHERE id = 3;

-- Update payment 4 with missing columns
UPDATE payment SET
  description = 'bicicleta'
WHERE id = 4;

-- Update payment 5 with missing columns
UPDATE payment SET
  description = 'Test payment'
WHERE id = 5;

-- Update payment 6 with missing columns
UPDATE payment SET
  description = 'Deposito Renta'
WHERE id = 6;

-- Update payment 7 with missing columns
UPDATE payment SET
  description = 'Deposito Renta'
WHERE id = 7;

-- Update payment 8 with missing columns
UPDATE payment SET
  description = 'Deposito '
WHERE id = 8;

-- Update payment 9 with missing columns
UPDATE payment SET
  description = 'Deposito '
WHERE id = 9;

-- Update payment 10 with missing columns
UPDATE payment SET
  description = 'Deposito '
WHERE id = 10;

-- Update payment 11 with missing columns
UPDATE payment SET
  description = 'Deposito '
WHERE id = 11;

-- Update payment 12 with missing columns
UPDATE payment SET
  description = 'Deposito '
WHERE id = 12;

-- Update payment 13 with missing columns
UPDATE payment SET
  description = 'Deposito Test',
  reference = 'test-seller@kustodia.mx'
WHERE id = 13;

-- Update payment 14 with missing columns
UPDATE payment SET
  description = 'Test payment 110mxn 50% custody 1 day',
  reference = 'test-seller@example.com'
WHERE id = 14;

-- Update payment 15 with missing columns
UPDATE payment SET
  description = 'pago rodrigo anticipo bicicleta',
  reference = 'test-seller@kustodia.mx'
WHERE id = 15;

-- Update payment 16 with missing columns
UPDATE payment SET
  description = 'deposito',
  reference = 'test-seller@kustodia.mx'
WHERE id = 16;

-- Update payment 17 with missing columns
UPDATE payment SET
  description = 'pago bicicleta',
  reference = 'test-seller@kustodia.mx'
WHERE id = 17;

-- Update payment 18 with missing columns
UPDATE payment SET
  description = 'test',
  reference = 'rodrigojille6@gmail.com',
  deposit_clabe = '710969000000351083'
WHERE id = 18;

-- Update payment 19 with missing columns
UPDATE payment SET
  description = 'test',
  reference = 'rodrigojille6@gmail.com',
  blockchain_tx_hash = '0xb358377b838db621b55b9f8c90c87a5175ee468be6550a1377c4ee6f80476c4a',
  deposit_clabe = '710969000000351083'
WHERE id = 19;

-- Update payment 20 with missing columns
UPDATE payment SET
  description = 'Test payment',
  reference = '20',
  travel_rule_data = '{"purpose":"Escrow payment test","originator":{"name":"John Doe","address":"123 Main St, Mexico City","country":"MX","id_number":"A12345678"},"beneficiary":{"name":"Jane Seller","address":"456 Seller Ave, Mexico City","country":"MX","id_number":"B98765432"},"compliance_id":"dummy-travel-rule-001"}'::jsonb,
  deposit_clabe = '710969000000351106',
  payout_clabe = '002668900881819471'
WHERE id = 20;

-- Update payment 21 with missing columns
UPDATE payment SET
  description = 'Anticipo trabajos',
  reference = '21',
  deposit_clabe = '710969000000351106',
  payout_clabe = '002668900881819471'
WHERE id = 21;

-- Update payment 22 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '488b963f-ac65-4606-ac51-2f9844e4b481',
  transaction_id = '488b963f-ac65-4606-ac51-2f9844e4b481',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 22;

-- Update payment 23 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '2c64a4a9-88ef-455e-9252-939f156f1f31',
  transaction_id = '2c64a4a9-88ef-455e-9252-939f156f1f31',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 23;

-- Update payment 24 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = 'a6be1d01-b50f-48d7-a3cc-7ca7a543c76e',
  transaction_id = 'a6be1d01-b50f-48d7-a3cc-7ca7a543c76e',
  blockchain_tx_hash = '0x7f8561dad5cc3f3ce01db6ee9375892854204f4921486409e7ebb1105041bb33',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 24;

-- Update payment 25 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '488b963f-ac65-4606-ac51-2f9844e4b481',
  transaction_id = '488b963f-ac65-4606-ac51-2f9844e4b481',
  blockchain_tx_hash = '0x2675519fae098e1d2b9992e44dd66c36be78069d99e1f91f2c7c9a10359da6ae',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 25;

-- Update payment 26 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '26',
  blockchain_tx_hash = '0x3dd2898eab5f559f6ced57c15f93db03265522187c4538e50e5fee35f1d49e3b',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 26;

-- Update payment 27 with missing columns
UPDATE payment SET
  description = 'E2E Dispute Test Payment',
  reference = '27',
  blockchain_tx_hash = '0x406ea3fd5cd5cbe833b23f2826547f827c2b8823c4d6e16fa88b05fc511611c0',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 27;

-- Update payment 28 with missing columns
UPDATE payment SET
  description = 'E2E Dispute Test Payment',
  reference = '28',
  blockchain_tx_hash = '0x2aed88963dce3aea1541bae405dd2ea0a87a8b9ae087ac1dddc5a201d3835adb',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 28;

-- Update payment 29 with missing columns
UPDATE payment SET
  description = 'E2E Dispute Test Payment',
  reference = '29',
  blockchain_tx_hash = '0x913665c883ba6f4d15d11ff02296c4214ffb8cf23ab2bc14d64b3e652910d2be',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 29;

-- Update payment 30 with missing columns
UPDATE payment SET
  description = 'E2E Monitor Payout Test',
  reference = '30',
  blockchain_tx_hash = '0x58ce52864ea889226bdc0d200e3883e8899385576acaff48f0a37f578a650eff',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 30;

-- Update payment 31 with missing columns
UPDATE payment SET
  description = 'E2E Monitor Payout Test',
  reference = '31',
  blockchain_tx_hash = '0xac0b665ee09299f51218d0d9918806bfd6438684bd53d2ba2520b46dc2fdbd62',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 31;

-- Update payment 32 with missing columns
UPDATE payment SET
  description = 'E2E Monitor Payout Test',
  reference = '32',
  blockchain_tx_hash = '0xe19575811eb426d2f4debb6cb51e4d9a03072d34b9ce8b8b60239e0512b041a1',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 32;

-- Update payment 33 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '33',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 33;

-- Update payment 34 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '34',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 34;

-- Update payment 35 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '35',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 35;

-- Update payment 36 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '36',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 36;

-- Update payment 37 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '37',
  blockchain_tx_hash = '0x23d2bf2730280d7223d345084c0c2303ad3b907705edd1b55e50040da9551718',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 37;

-- Update payment 38 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '38',
  blockchain_tx_hash = '0xd854dfb8842614a1e8a547e705f733a23a03825ed1c2319b7048e3129f539ae0',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 38;

-- Update payment 39 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '39',
  blockchain_tx_hash = '0x2e73491a66d9bea277aec6ae08feea3cd67334494b70efe1dc4ea86b4f71b28a',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 39;

-- Update payment 40 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '40',
  blockchain_tx_hash = '0x26ef90995470a14e7e1822af403ba5f182095526cdd3b2fb282c7bb4dedc808f',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 40;

-- Update payment 41 with missing columns
UPDATE payment SET
  description = 'E2E Monitor Payout Test',
  reference = '41',
  blockchain_tx_hash = '0x3ddb4a9c4ccdc36bbdce5fcd062b2dd19f1a055837a5a3f1836843a8edabf9c0',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 41;

-- Update payment 42 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '42',
  blockchain_tx_hash = '0xde0c40559791e38d77acf8e1f9207efdbae974056e75fa0b01b0de400c2cf09d',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 42;

-- Update payment 43 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '43',
  blockchain_tx_hash = '0xf432747124f0d39f84c29d1508f220213b8c4305112914bfb10e22d4eef75870',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 43;

-- Update payment 44 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '44',
  blockchain_tx_hash = '0x395e152df3ba0cfa313fe9ef42c102f054b4a5f1cbf76b88317f53185fe7db35',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 44;

-- Update payment 45 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '45',
  blockchain_tx_hash = '0xa848b3f0918d6b15afdd947ae72e5e57d61739934428b070ebebff7cbabe5f13',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 45;

-- Update payment 46 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '46',
  blockchain_tx_hash = '0x5ddf6688a9741a0ad1c980d40d07e9157a4096f594006f44117be644c7303a25',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 46;

-- Update payment 47 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '47',
  blockchain_tx_hash = '0x44ecd4b794653a64e87879b9c060e93a790cfebd9e97f5d9774532c101b729b1',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 47;

-- Update payment 48 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '48',
  blockchain_tx_hash = '0xee3a48632ee9f7bdf121429110f33d54de6c0802d8614d90e67ba1447f6d3b34',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 48;

-- Update payment 49 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '49',
  blockchain_tx_hash = '0x8c423a0a06908a7f5ad33f80aa7e42e2abc90f9fef76647c4b59893ddc442ccb',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 49;

-- Update payment 50 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '50',
  blockchain_tx_hash = '0x7e448111fbfb1fa5b860d4394c9ecd66c2a40939d01abfdb1e532fc8d8d32da4',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 50;

-- Update payment 51 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment (No Custody)',
  reference = '51',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 51;

-- Update payment 52 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '52',
  blockchain_tx_hash = '0x1965c388f91bd884769c0f3d3017e551a8b9c66b34dd3dca4bb89825a7c6a422',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 52;

-- Update payment 53 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment (No Custody)',
  reference = '53',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 53;

-- Update payment 54 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '54',
  blockchain_tx_hash = '0x5edba34a7b26deeafa93d74755ce593748866c57b9a626b1443ce8b76592e46c',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 54;

-- Update payment 55 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment (No Custody)',
  reference = '55',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 55;

-- Update payment 56 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '56',
  blockchain_tx_hash = '0x07d06f1ed127087278ee0a367d1f4dbfb4f9c757ebf997eb7641b9e36f459dc1',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 56;

-- Update payment 57 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment (No Custody)',
  reference = '57',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 57;

-- Update payment 58 with missing columns
UPDATE payment SET
  description = 'E2E Test Payment',
  reference = '58',
  travel_rule_data = '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb,
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471'
WHERE id = 58;

-- Update payment 59 with missing columns
UPDATE payment SET
  description = 'Anticipo',
  reference = '59',
  deposit_clabe = '710969000000351106',
  payout_clabe = '002668900881819471'
WHERE id = 59;

-- Update payment 60 with missing columns
UPDATE payment SET
  description = 'Anticipo trabajos',
  reference = '06eae85e-bf96-4ec4-9f88-0cb41500f902',
  transaction_id = '06eae85e-bf96-4ec4-9f88-0cb41500f902',
  deposit_clabe = '710969000000351106',
  payout_clabe = '002668900881819471'
WHERE id = 60;

-- Update payment 61 with missing columns
UPDATE payment SET
  description = 'Anticipo',
  reference = '15ff4d2f-62c5-4558-a494-1b13e67b489b',
  transaction_id = '15ff4d2f-62c5-4558-a494-1b13e67b489b',
  blockchain_tx_hash = '0x3b2e7dd88c73338370d001d90345c6b1ca4af659b2b4a145615ae10bab735fd0',
  deposit_clabe = '710969000000351106',
  payout_clabe = '002668900881819471'
WHERE id = 61;

-- Update payment 62 with missing columns
UPDATE payment SET
  description = 'Apartado departamento reforma 1 int 156'
WHERE id = 62;

-- Update payment 63 with missing columns
UPDATE payment SET
  description = 'test'
WHERE id = 63;

-- Update payment 64 with missing columns
UPDATE payment SET
  description = 'Test'
WHERE id = 64;

-- Update payment 65 with missing columns
UPDATE payment SET
  description = 'test'
WHERE id = 65;

-- Update payment 66 with missing columns
UPDATE payment SET
  description = 'test'
WHERE id = 66;

-- Update payment 67 with missing columns
UPDATE payment SET
  description = 'Test'
WHERE id = 67;

-- Update payment 68 with missing columns
UPDATE payment SET
  description = 'Test'
WHERE id = 68;

-- Update payment 69 with missing columns
UPDATE payment SET
  description = 'Trabajos de remodelacion',
  reference = '69',
  deposit_clabe = '710969000000351106',
  payout_clabe = '002668900881819471'
WHERE id = 69;

-- Update payment 70 with missing columns
UPDATE payment SET
  description = 'Trabajos carpinteria',
  reference = '15ff4d2f-62c5-4558-a494-1b13e67b489b',
  transaction_id = '15ff4d2f-62c5-4558-a494-1b13e67b489b',
  deposit_clabe = '710969000000351106',
  payout_clabe = '002668900881819471',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 70;

-- Update payment 71 with missing columns
UPDATE payment SET
  description = 'Trabajos albañileria',
  reference = '15ff4d2f-62c5-4558-a494-1b13e67b489b',
  transaction_id = '15ff4d2f-62c5-4558-a494-1b13e67b489b',
  deposit_clabe = '710969000000351106',
  payout_clabe = '002668900881819471',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 71;

-- Update payment 72 with missing columns
UPDATE payment SET
  description = 'Pago de prueba CLABE única',
  reference = '72',
  deposit_clabe = '710969000000363217',
  payout_clabe = '002668900881819471',
  payer_email = 'test-seller@kustodia.mx'
WHERE id = 72;

-- Update payment 73 with missing columns
UPDATE payment SET
  description = 'Trabajos de carpinteria',
  reference = 'cf8703c9-b7ff-4b54-b394-763630bf1ebf',
  transaction_id = 'cf8703c9-b7ff-4b54-b394-763630bf1ebf',
  deposit_clabe = '710969000000363220',
  payout_clabe = '002668900881819471',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 73;

-- Update payment 74 with missing columns
UPDATE payment SET
  reference = '74',
  deposit_clabe = '710969000000363505',
  payout_clabe = '002668900881819471',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 74;

-- Update payment 75 with missing columns
UPDATE payment SET
  description = 'test wallet to wallet',
  reference = '75',
  deposit_clabe = '710969000000363518',
  payout_clabe = '002668900881819471',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 75;

-- Update payment 76 with missing columns
UPDATE payment SET
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 76;

-- Update payment 77 with missing columns
UPDATE payment SET
  description = 'test wallet to wallet',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 77;

-- Update payment 78 with missing columns
UPDATE payment SET
  description = 'test wallet',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 78;

-- Update payment 79 with missing columns
UPDATE payment SET
  description = 'test wallet to wallet',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 79;

-- Update payment 80 with missing columns
UPDATE payment SET
  description = 'test wallet to wallet',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 80;

-- Update payment 81 with missing columns
UPDATE payment SET
  description = 'Test E2E',
  reference = '06eae85e-bf96-4ec4-9f88-0cb41500f902',
  transaction_id = '06eae85e-bf96-4ec4-9f88-0cb41500f902',
  deposit_clabe = '710969000000364656',
  payout_clabe = '002668900881819471',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 81;

-- Update payment 82 with missing columns
UPDATE payment SET
  description = 'Test escrow',
  reference = '82',
  travel_rule_data = '{"sender":"Test","receiver":"Test"}'::jsonb,
  deposit_clabe = '710969000000364753',
  payout_clabe = '002668900881819471',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 82;

-- Update payment 83 with missing columns
UPDATE payment SET
  description = 'test clabe',
  reference = 'a6be1d01-b50f-48d7-a3cc-7ca7a543c76e',
  transaction_id = 'a6be1d01-b50f-48d7-a3cc-7ca7a543c76e',
  deposit_clabe = '710969000000396022',
  payout_clabe = '002668900881819471',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 83;

-- Update payment 84 with missing columns
UPDATE payment SET
  description = 'Apartado depa tabasco 109',
  reference = 'cf8703c9-b7ff-4b54-b394-763630bf1ebf',
  transaction_id = 'cf8703c9-b7ff-4b54-b394-763630bf1ebf',
  deposit_clabe = '710969000000396640',
  payout_clabe = '002668900881819471',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 84;

-- Update payment 85 with missing columns
UPDATE payment SET
  description = 'Test E2E',
  reference = '85',
  transaction_id = 'fd7a3a104c7541f0baf612573a1843c0',
  deposit_clabe = '710969000000400730',
  payout_clabe = '002668900881819471',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 85;

-- Update payment 86 with missing columns
UPDATE payment SET
  description = 'Test Audit E2E',
  reference = '86',
  deposit_clabe = '710969000000400785',
  payout_clabe = '002668900881819471',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 86;

-- Update payment 87 with missing columns
UPDATE payment SET
  description = 'Test end to end',
  transaction_id = '5530572',
  deposit_clabe = '710969000000400853',
  payout_clabe = '002668900881819471',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 87;

-- Update payment 88 with missing columns
UPDATE payment SET
  description = 'Test automation',
  reference = '9b35cc1fdfc84d639395e79ee935b66a',
  transaction_id = '5530706',
  deposit_clabe = '710969000000401108',
  payout_clabe = '002668900881819471',
  juno_payment_id = '66e55baa-a812-4661-b691-98ffed7df59b',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 88;

-- Update payment 89 with missing columns
UPDATE payment SET
  description = 'Deposito mes de renta depa',
  reference = '5a5128675a4f4c7682e326a0c559e939',
  transaction_id = '5533283',
  deposit_clabe = '710969000000401438',
  payout_clabe = '002668900881819471',
  juno_payment_id = 'c67ea8ed-47a4-4c83-94fe-4e6d8354aa88',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 89;

-- Update payment 90 with missing columns
UPDATE payment SET
  description = 'Apartado departamento tabasco 129',
  reference = '499e6107a4064360aecc8376fd3cddb4',
  transaction_id = '5533299',
  deposit_clabe = '710969000000401454',
  payout_clabe = '002668900881819471',
  payer_email = 'rodrigojille6@gmail.com',
  payer_approval = true,
  payee_approval = true,
  payer_approval_timestamp = '2025-07-11T00:03:41.712Z',
  payee_approval_timestamp = '2025-07-11T00:07:27.988Z',
  release_conditions = 'A la firma del contrato de compraventa',
  vertical_type = 'inmobiliaria'
WHERE id = 90;

-- Update payment 91 with missing columns
UPDATE payment SET
  description = 'Test Wallet',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 91;

-- Update payment 92 with missing columns
UPDATE payment SET
  description = 'Test Wallet to Wallet',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 92;

-- Update payment 93 with missing columns
UPDATE payment SET
  description = 'Test',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 93;

-- Update payment 94 with missing columns
UPDATE payment SET
  description = 'test',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 94;

-- Update payment 95 with missing columns
UPDATE payment SET
  description = 'Test1',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 95;

-- Update payment 104 with missing columns
UPDATE payment SET
  description = 'te',
  deposit_clabe = '646974652032292015',
  payout_clabe = '002668900881819471',
  payout_juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  commission_amount = 0.00,
  payer_clabe = '710969000000351083',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 104;

-- Update payment 105 with missing columns
UPDATE payment SET
  description = 'Testx',
  reference = '105',
  deposit_clabe = '646395487461979582',
  payout_clabe = '002668900881819471',
  payout_juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  commission_amount = 0.00,
  payer_clabe = '710969000000351083',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 105;

-- Update payment 106 with missing columns
UPDATE payment SET
  description = 'testxs',
  reference = '106',
  deposit_clabe = '646588045407439433',
  payout_clabe = '002668900881819471',
  payout_juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  commission_amount = 0.00,
  payer_clabe = '710969000000351083',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 106;

-- Update payment 107 with missing columns
UPDATE payment SET
  description = 'testxw',
  reference = '107',
  deposit_clabe = '646059200614638151',
  payout_clabe = '002668900881819471',
  payout_juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  commission_amount = 0.00,
  payer_clabe = '710969000000351083',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 107;

-- Update payment 108 with missing columns
UPDATE payment SET
  description = 'TestX2',
  reference = '108',
  deposit_clabe = '646112377005428612',
  payout_clabe = '002668900881819471',
  payout_juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  commission_amount = 0.00,
  payer_clabe = '710969000000351083',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 108;

-- Update payment 109 with missing columns
UPDATE payment SET
  description = 'TestX2',
  reference = '109',
  deposit_clabe = '646578080360251494',
  payout_clabe = '002668900881819471',
  payout_juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  commission_amount = 0.00,
  payer_clabe = '710969000000351083',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 109;

-- Update payment 110 with missing columns
UPDATE payment SET
  description = 'Test888',
  reference = '5002a090cd634246806f5a6530538805',
  transaction_id = '5537820',
  deposit_clabe = '710969000000401454',
  payout_clabe = '002668900881819471',
  payout_juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  commission_amount = 0.00,
  payer_clabe = '710969000000351083',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 110;

-- Update payment 111 with missing columns
UPDATE payment SET
  description = 'Testx1',
  reference = '1e31f30483214316ace68699e30bd662',
  transaction_id = '5537832',
  deposit_clabe = '710969000000410937',
  payout_clabe = '002668900881819471',
  payout_juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  commission_amount = 0.00,
  payer_clabe = '710969000000351083',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 111;

-- Update payment 112 with missing columns
UPDATE payment SET
  description = 'Apartado depa sonora 398',
  reference = '25cb3a9b0348451a8476425c1c9fb593',
  transaction_id = '5537854',
  deposit_clabe = '710969000000410995',
  payout_clabe = '002668900881819471',
  payout_juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  commission_amount = 0.00,
  payer_clabe = '710969000000351083',
  payer_email = 'rodrigojille6@gmail.com',
  payer_approval = false,
  payee_approval = false,
  release_conditions = 'A la firma del contrato de renta',
  vertical_type = 'inmobiliaria'
WHERE id = 112;

-- Update payment 113 with missing columns
UPDATE payment SET
  description = 'Apartado Roma Norte 123',
  reference = '7a93aa14fd31496fb574ed3ea6edd63f',
  transaction_id = '5537871',
  deposit_clabe = '710969000000411004',
  payout_clabe = '002668900881819471',
  payout_juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  commission_amount = 0.00,
  payer_clabe = '710969000000351083',
  payer_email = 'rodrigojille6@gmail.com',
  payer_approval = false,
  payee_approval = false,
  release_conditions = 'A la firma del contrato',
  vertical_type = 'inmobiliaria'
WHERE id = 113;

-- Update payment 114 with missing columns
UPDATE payment SET
  description = 'Test Hack MXNB',
  deposit_clabe = '710969000000411130',
  payout_clabe = '002668900881819471',
  payout_juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  commission_amount = 0.00,
  payer_clabe = '710969000000351083',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 114;

-- Update payment 115 with missing columns
UPDATE payment SET
  description = 'Test MXNB Hackaton',
  deposit_clabe = '710969000000411295',
  payout_clabe = '002668900881819471',
  payout_juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  commission_amount = 0.00,
  payer_clabe = '710969000000351083',
  payer_email = 'rodrigojille6@gmail.com'
WHERE id = 115;

-- Update payment 116 with missing columns
UPDATE payment SET
  description = 'Test Hackaton MXNB',
  deposit_clabe = '710969000000411305',
  payout_clabe = '002668900881819471',
  payout_juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  commission_amount = 0.00,
  payer_clabe = '710969000000351083',
  payer_email = 'rodrigojille6@gmail.com',
  payer_approval = false,
  payee_approval = false,
  release_conditions = 'A la firma del contrato de renta',
  vertical_type = 'inmobiliaria'
WHERE id = 116;

-- Verification: Check updated columns
SELECT id, description, reference, transaction_id, commission_percent, commission_amount, payer_email, vertical_type
FROM payment WHERE id <= 10 ORDER BY id;
