-- Fix Missing Escrow Columns
-- Generated on 2025-07-15T00:32:26.663Z

-- Update escrow 1 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-08T00:38:26.980Z'
WHERE id = 1;

-- Update escrow 2 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-08T00:38:26.980Z'
WHERE id = 2;

-- Update escrow 3 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-08T00:38:26.980Z'
WHERE id = 3;

-- Update escrow 4 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0',
  custody_end = '2025-05-08T00:38:26.980Z'
WHERE id = 4;

-- Update escrow 5 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '1',
  custody_end = '2025-05-08T00:38:26.980Z'
WHERE id = 5;

-- Update escrow 6 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0',
  custody_end = '2025-05-08T00:38:26.980Z'
WHERE id = 6;

-- Update escrow 7 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '1',
  custody_end = '2025-05-08T00:38:26.980Z'
WHERE id = 7;

-- Update escrow 8 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-08T00:38:26.980Z'
WHERE id = 8;

-- Update escrow 9 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-08T00:38:26.980Z'
WHERE id = 9;

-- Update escrow 10 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-08T00:38:26.980Z'
WHERE id = 10;

-- Update escrow 11 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-08T00:38:26.980Z'
WHERE id = 11;

-- Update escrow 12 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-08T00:38:26.980Z'
WHERE id = 12;

-- Update escrow 13 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-08T00:38:26.980Z'
WHERE id = 13;

-- Update escrow 14 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0',
  blockchain_tx_hash = '0xb358377b838db621b55b9f8c90c87a5175ee468be6550a1377c4ee6f80476c4a',
  custody_end = '2025-05-08T00:38:26.980Z'
WHERE id = 14;

-- Update escrow 15 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-19T01:12:05.620Z'
WHERE id = 15;

-- Update escrow 16 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-10T04:38:10.216Z'
WHERE id = 16;

-- Update escrow 17 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-10T22:36:13.842Z'
WHERE id = 17;

-- Update escrow 18 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-10T22:36:29.097Z'
WHERE id = 18;

-- Update escrow 19 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x7f8561dad5cc3f3ce01db6ee9375892854204f4921486409e7ebb1105041bb33',
  blockchain_tx_hash = '0x7f8561dad5cc3f3ce01db6ee9375892854204f4921486409e7ebb1105041bb33',
  custody_end = '2025-05-10T22:40:01.922Z'
WHERE id = 19;

-- Update escrow 20 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x2675519fae098e1d2b9992e44dd66c36be78069d99e1f91f2c7c9a10359da6ae',
  blockchain_tx_hash = '0x2675519fae098e1d2b9992e44dd66c36be78069d99e1f91f2c7c9a10359da6ae',
  custody_end = '2025-05-10T22:40:54.596Z'
WHERE id = 20;

-- Update escrow 21 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x3dd2898eab5f559f6ced57c15f93db03265522187c4538e50e5fee35f1d49e3b',
  blockchain_tx_hash = '0x3dd2898eab5f559f6ced57c15f93db03265522187c4538e50e5fee35f1d49e3b',
  custody_end = '2025-05-10T22:44:05.407Z'
WHERE id = 21;

-- Update escrow 22 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x406ea3fd5cd5cbe833b23f2826547f827c2b8823c4d6e16fa88b05fc511611c0',
  blockchain_tx_hash = '0x406ea3fd5cd5cbe833b23f2826547f827c2b8823c4d6e16fa88b05fc511611c0',
  custody_end = '2025-05-10T22:48:16.148Z'
WHERE id = 22;

-- Update escrow 23 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x2aed88963dce3aea1541bae405dd2ea0a87a8b9ae087ac1dddc5a201d3835adb',
  blockchain_tx_hash = '0x2aed88963dce3aea1541bae405dd2ea0a87a8b9ae087ac1dddc5a201d3835adb',
  custody_end = '2025-05-10T22:50:14.690Z'
WHERE id = 23;

-- Update escrow 24 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x913665c883ba6f4d15d11ff02296c4214ffb8cf23ab2bc14d64b3e652910d2be',
  blockchain_tx_hash = '0x913665c883ba6f4d15d11ff02296c4214ffb8cf23ab2bc14d64b3e652910d2be',
  custody_end = '2025-05-10T22:58:18.634Z',
  dispute_reason = 'Item not delivered',
  dispute_details = 'The item was not delivered as promised.',
  dispute_history = '[{"at":"2025-05-10T22:57:37.212Z","by":3,"action":"raised","reason":"Item not delivered","details":"The item was not delivered as promised.","evidence":null}]'::jsonb
WHERE id = 24;

-- Update escrow 25 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x58ce52864ea889226bdc0d200e3883e8899385576acaff48f0a37f578a650eff',
  blockchain_tx_hash = '0x58ce52864ea889226bdc0d200e3883e8899385576acaff48f0a37f578a650eff',
  custody_end = '2025-05-10T23:00:38.165Z'
WHERE id = 25;

-- Update escrow 26 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0xac0b665ee09299f51218d0d9918806bfd6438684bd53d2ba2520b46dc2fdbd62',
  blockchain_tx_hash = '0xac0b665ee09299f51218d0d9918806bfd6438684bd53d2ba2520b46dc2fdbd62',
  custody_end = '2025-05-10T23:03:20.521Z'
WHERE id = 26;

-- Update escrow 27 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0xe19575811eb426d2f4debb6cb51e4d9a03072d34b9ce8b8b60239e0512b041a1',
  blockchain_tx_hash = '0xe19575811eb426d2f4debb6cb51e4d9a03072d34b9ce8b8b60239e0512b041a1',
  custody_end = '2025-05-11T04:41:41.486Z'
WHERE id = 27;

-- Update escrow 28 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-21T18:45:32.716Z'
WHERE id = 28;

-- Update escrow 29 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-21T19:53:23.946Z'
WHERE id = 29;

-- Update escrow 30 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-21T19:54:36.130Z'
WHERE id = 30;

-- Update escrow 31 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-21T20:07:08.324Z'
WHERE id = 31;

-- Update escrow 32 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x23d2bf2730280d7223d345084c0c2303ad3b907705edd1b55e50040da9551718',
  blockchain_tx_hash = '0x23d2bf2730280d7223d345084c0c2303ad3b907705edd1b55e50040da9551718',
  custody_end = '2025-05-23T01:40:26.664Z'
WHERE id = 32;

-- Update escrow 33 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0xd854dfb8842614a1e8a547e705f733a23a03825ed1c2319b7048e3129f539ae0',
  blockchain_tx_hash = '0xd854dfb8842614a1e8a547e705f733a23a03825ed1c2319b7048e3129f539ae0',
  custody_end = '2025-05-23T01:58:56.546Z'
WHERE id = 33;

-- Update escrow 34 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x2e73491a66d9bea277aec6ae08feea3cd67334494b70efe1dc4ea86b4f71b28a',
  blockchain_tx_hash = '0x2e73491a66d9bea277aec6ae08feea3cd67334494b70efe1dc4ea86b4f71b28a',
  custody_end = '2025-05-23T02:02:57.119Z'
WHERE id = 34;

-- Update escrow 35 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x26ef90995470a14e7e1822af403ba5f182095526cdd3b2fb282c7bb4dedc808f',
  blockchain_tx_hash = '0x26ef90995470a14e7e1822af403ba5f182095526cdd3b2fb282c7bb4dedc808f',
  custody_end = '2025-05-23T02:40:57.020Z'
WHERE id = 35;

-- Update escrow 36 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x3ddb4a9c4ccdc36bbdce5fcd062b2dd19f1a055837a5a3f1836843a8edabf9c0',
  blockchain_tx_hash = '0x3ddb4a9c4ccdc36bbdce5fcd062b2dd19f1a055837a5a3f1836843a8edabf9c0',
  custody_end = '2025-05-23T03:27:39.997Z'
WHERE id = 36;

-- Update escrow 37 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0xde0c40559791e38d77acf8e1f9207efdbae974056e75fa0b01b0de400c2cf09d',
  blockchain_tx_hash = '0xde0c40559791e38d77acf8e1f9207efdbae974056e75fa0b01b0de400c2cf09d',
  custody_end = '2025-05-23T03:34:31.525Z'
WHERE id = 37;

-- Update escrow 38 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0xf432747124f0d39f84c29d1508f220213b8c4305112914bfb10e22d4eef75870',
  blockchain_tx_hash = '0xf432747124f0d39f84c29d1508f220213b8c4305112914bfb10e22d4eef75870',
  custody_end = '2025-05-23T03:37:44.835Z'
WHERE id = 38;

-- Update escrow 39 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x395e152df3ba0cfa313fe9ef42c102f054b4a5f1cbf76b88317f53185fe7db35',
  blockchain_tx_hash = '0x395e152df3ba0cfa313fe9ef42c102f054b4a5f1cbf76b88317f53185fe7db35',
  custody_end = '2025-05-23T03:38:38.593Z'
WHERE id = 39;

-- Update escrow 40 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0xa848b3f0918d6b15afdd947ae72e5e57d61739934428b070ebebff7cbabe5f13',
  blockchain_tx_hash = '0xa848b3f0918d6b15afdd947ae72e5e57d61739934428b070ebebff7cbabe5f13',
  custody_end = '2025-05-23T03:40:10.085Z'
WHERE id = 40;

-- Update escrow 41 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x5ddf6688a9741a0ad1c980d40d07e9157a4096f594006f44117be644c7303a25',
  blockchain_tx_hash = '0x5ddf6688a9741a0ad1c980d40d07e9157a4096f594006f44117be644c7303a25',
  custody_end = '2025-05-23T03:41:28.810Z'
WHERE id = 41;

-- Update escrow 42 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x44ecd4b794653a64e87879b9c060e93a790cfebd9e97f5d9774532c101b729b1',
  blockchain_tx_hash = '0x44ecd4b794653a64e87879b9c060e93a790cfebd9e97f5d9774532c101b729b1',
  custody_end = '2025-05-23T03:42:19.994Z'
WHERE id = 42;

-- Update escrow 43 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0xee3a48632ee9f7bdf121429110f33d54de6c0802d8614d90e67ba1447f6d3b34',
  blockchain_tx_hash = '0xee3a48632ee9f7bdf121429110f33d54de6c0802d8614d90e67ba1447f6d3b34',
  custody_end = '2025-05-23T03:43:12.242Z'
WHERE id = 43;

-- Update escrow 44 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x8c423a0a06908a7f5ad33f80aa7e42e2abc90f9fef76647c4b59893ddc442ccb',
  blockchain_tx_hash = '0x8c423a0a06908a7f5ad33f80aa7e42e2abc90f9fef76647c4b59893ddc442ccb',
  custody_end = '2025-05-23T03:51:57.582Z'
WHERE id = 44;

-- Update escrow 45 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x7e448111fbfb1fa5b860d4394c9ecd66c2a40939d01abfdb1e532fc8d8d32da4',
  blockchain_tx_hash = '0x7e448111fbfb1fa5b860d4394c9ecd66c2a40939d01abfdb1e532fc8d8d32da4',
  custody_end = '2025-05-23T03:53:58.250Z'
WHERE id = 45;

-- Update escrow 46 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-23T03:53:14.627Z'
WHERE id = 46;

-- Update escrow 47 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x1965c388f91bd884769c0f3d3017e551a8b9c66b34dd3dca4bb89825a7c6a422',
  blockchain_tx_hash = '0x1965c388f91bd884769c0f3d3017e551a8b9c66b34dd3dca4bb89825a7c6a422',
  custody_end = '2025-05-23T03:55:18.099Z'
WHERE id = 47;

-- Update escrow 48 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-23T03:54:30.368Z'
WHERE id = 48;

-- Update escrow 49 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x5edba34a7b26deeafa93d74755ce593748866c57b9a626b1443ce8b76592e46c',
  blockchain_tx_hash = '0x5edba34a7b26deeafa93d74755ce593748866c57b9a626b1443ce8b76592e46c',
  custody_end = '2025-05-23T03:56:13.942Z'
WHERE id = 49;

-- Update escrow 50 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-23T03:57:18.069Z'
WHERE id = 50;

-- Update escrow 51 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0x07d06f1ed127087278ee0a367d1f4dbfb4f9c757ebf997eb7641b9e36f459dc1',
  blockchain_tx_hash = '0x07d06f1ed127087278ee0a367d1f4dbfb4f9c757ebf997eb7641b9e36f459dc1',
  custody_end = '2025-05-23T03:56:32.537Z'
WHERE id = 51;

-- Update escrow 52 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-23T03:57:36.714Z'
WHERE id = 52;

-- Update escrow 53 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-22T06:00:00.000Z'
WHERE id = 53;

-- Update escrow 54 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-25T21:53:05.068Z'
WHERE id = 54;

-- Update escrow 55 with missing columns
UPDATE escrow SET
  custody_end = '2025-05-28T23:18:22.421Z'
WHERE id = 55;

-- Update escrow 56 with missing columns
UPDATE escrow SET
  blockchain_tx_hash = '0x3b2e7dd88c73338370d001d90345c6b1ca4af659b2b4a145615ae10bab735fd0',
  custody_end = '2025-05-28T23:28:00.726Z'
WHERE id = 56;

-- Update escrow 57 with missing columns
UPDATE escrow SET
  custody_end = '2025-06-09T14:54:51.260Z'
WHERE id = 57;

-- Update escrow 58 with missing columns
UPDATE escrow SET
  custody_end = '2025-06-12T17:05:54.239Z'
WHERE id = 58;

-- Update escrow 59 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '1',
  blockchain_tx_hash = '0xc3d13d1bdf92e8c056bb7657786fde56e276c465ba32b553b95829919b228133',
  release_tx_hash = '0xc8b0422b33...',
  custody_end = '2025-06-12T17:35:55.097Z',
  dispute_reason = 'test',
  dispute_details = 'test',
  dispute_evidence = '{"/uploads/evidence/1749422289168-731210727-Kustodia_by_Czentral_(10).pdf"}',
  dispute_history = '[{"at":"2025-06-08T22:38:09.225Z","by":2,"action":"raised","reason":"test","details":"test","evidence":["/uploads/evidence/1749422289168-731210727-Kustodia_by_Czentral_(10).pdf"]}]'::jsonb
WHERE id = 59;

-- Update escrow 60 with missing columns
UPDATE escrow SET
  custody_end = '2025-06-19T00:20:08.107Z'
WHERE id = 60;

-- Update escrow 61 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '2',
  blockchain_tx_hash = '0x59540ead7978f862f8ce4466eb38d2a516c9d991e8f6ed43fd8ae4b3a6c648ad',
  release_tx_hash = '0x9d8cc8483db87ae5527e2ca70fa2e622b9a80e8fbc9e729be13af41bd7dc99fd',
  custody_end = '2025-06-17T00:22:37.021Z'
WHERE id = 61;

-- Update escrow 62 with missing columns
UPDATE escrow SET
  custody_end = '2025-06-16T01:52:40.412Z'
WHERE id = 62;

-- Update escrow 63 with missing columns
UPDATE escrow SET
  custody_end = '2025-06-16T02:01:48.732Z'
WHERE id = 63;

-- Update escrow 64 with missing columns
UPDATE escrow SET
-- No updates needed for escrow 64

-- Update escrow 65 with missing columns
UPDATE escrow SET
-- No updates needed for escrow 65

-- Update escrow 66 with missing columns
UPDATE escrow SET
-- No updates needed for escrow 66

-- Update escrow 67 with missing columns
UPDATE escrow SET
-- No updates needed for escrow 67

-- Update escrow 68 with missing columns
UPDATE escrow SET
-- No updates needed for escrow 68

-- Update escrow 69 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '{"type":"BigNumber","hex":"0x01"}',
  blockchain_tx_hash = '0x605519dbd29bafdab81933238c49978c2c1cdbc041ff2b1b235e243cf0ed6112',
  release_tx_hash = 'smart_contract_escrow_released',
  custody_end = '2025-06-18T19:44:49.375Z'
WHERE id = 69;

-- Update escrow 70 with missing columns
UPDATE escrow SET
  custody_end = '2025-06-19T21:42:46.000Z'
WHERE id = 70;

-- Update escrow 71 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '3',
  blockchain_tx_hash = '0x564b84efbf446ef3e3d802e38b0f3b5dce92f32d1bf3daf21859673f0e7d468b',
  release_tx_hash = 'auto-released-1750866603184',
  custody_end = '2025-06-25T03:10:21.132Z'
WHERE id = 71;

-- Update escrow 72 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '4',
  blockchain_tx_hash = '0x7c984b5747d0aac591e0fd01fa4ad4e326060e7349adc1ca3d365fb478cc32fd',
  custody_end = '2025-07-01T23:02:43.777Z'
WHERE id = 72;

-- Update escrow 73 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '1',
  blockchain_tx_hash = '0x520cb8c866671a9497ee81df15de5fe688d608b36afab5bc4f46c99e1eb30ce1',
  custody_end = '2025-07-06T02:10:33.000Z'
WHERE id = 73;

-- Update escrow 74 with missing columns
UPDATE escrow SET
  custody_end = '2025-07-06T16:02:00.436Z'
WHERE id = 74;

-- Update escrow 75 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '3',
  blockchain_tx_hash = '0x8b139b4a39132d2aac241fdc5af76b87b589a168db58da96d10c9d821fdcd3fd',
  custody_end = '2025-07-06T16:59:45.519Z'
WHERE id = 75;

-- Update escrow 76 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '4',
  blockchain_tx_hash = '0x40346b2b6e108b6f433b6878d497987f3b890785e1bae11aa5a374973af9c9be',
  release_tx_hash = 'auto-paid-1751921810231',
  custody_end = '2025-07-05T22:50:25.041Z'
WHERE id = 76;

-- Update escrow 77 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '5',
  blockchain_tx_hash = '0x7b7e4a94c523f2d5e62ca9f3ce8c07f17e183c5ff1b1520598f10f4e918fef54',
  release_tx_hash = 'manual-recovery-c67ea8ed-47a4-4c83-94fe-4e6d8354aa88',
  custody_end = '2025-07-09T22:24:48.075Z'
WHERE id = 77;

-- Update escrow 78 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '6',
  blockchain_tx_hash = '0xac418864b7aebb0e17c764c5ff015d6b8bf74e5524e80eb5b554c8895e5f0ccb',
  release_tx_hash = '0x636d426615560139516d8a6909792204134053af4829797956e4d797e2c2510',
  custody_end = '2025-07-11T00:11:46.914Z'
WHERE id = 78;

-- Update escrow 81 with missing columns
UPDATE escrow SET
  custody_end = '2025-07-10T00:33:03.876Z'
WHERE id = 81;

-- Update escrow 82 with missing columns
UPDATE escrow SET
  custody_end = '2025-07-10T00:41:04.528Z'
WHERE id = 82;

-- Update escrow 83 with missing columns
UPDATE escrow SET
  custody_end = '2025-07-10T01:00:31.590Z'
WHERE id = 83;

-- Update escrow 84 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0',
  custody_end = '2025-07-10T03:55:06.025Z'
WHERE id = 84;

-- Update escrow 85 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '0',
  custody_end = '2025-07-10T04:02:24.580Z'
WHERE id = 85;

-- Update escrow 91 with missing columns
UPDATE escrow SET
  custody_end = '2025-07-17T19:38:32.042Z'
WHERE id = 91;

-- Update escrow 92 with missing columns
UPDATE escrow SET
  custody_end = '2025-07-12T19:44:51.393Z'
WHERE id = 92;

-- Update escrow 93 with missing columns
UPDATE escrow SET
  custody_end = '2025-07-12T21:25:25.603Z'
WHERE id = 93;

-- Update escrow 94 with missing columns
UPDATE escrow SET
  custody_end = '2025-07-12T21:29:47.312Z'
WHERE id = 94;

-- Update escrow 95 with missing columns
UPDATE escrow SET
  custody_end = '2025-07-12T21:36:43.473Z'
WHERE id = 95;

-- Update escrow 96 with missing columns
UPDATE escrow SET
  custody_end = '2025-07-12T21:38:27.603Z'
WHERE id = 96;

-- Update escrow 97 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '7',
  blockchain_tx_hash = '0x59dbca8157b98f82df5d8f6c18c4e9c0d0c9c416a9d461928fcd9b94021fb1ee',
  release_tx_hash = '0x5e526f473fbe83a4df76e6be737a511f3e00acc04884e88232c6647deaed794d',
  custody_end = '2025-07-13T21:51:38.267Z'
WHERE id = 97;

-- Update escrow 98 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '8',
  blockchain_tx_hash = '0x839191f8dfd7d420d71d2f40a777457737e1ca660c8ebbe1cf107bcb0c493375',
  release_tx_hash = '0x09e09f062d9e73030d7457d5af0670e0fe5225b63023e187ede5bd9b93509d78',
  custody_end = '2025-07-13T22:41:48.985Z'
WHERE id = 98;

-- Update escrow 99 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '9',
  blockchain_tx_hash = '0x63712a0d731c782349065b689868e5f750858f33782ee78b38932e907ae36e80',
  custody_end = '2025-07-13T23:42:03.911Z'
WHERE id = 99;

-- Update escrow 100 with missing columns
UPDATE escrow SET
  smart_contract_escrow_id = '10',
  blockchain_tx_hash = '0xbb7970d7149473365bc6ed6f0bfd77b25009f83a96b2ae0482ead6465cd95b43',
  custody_end = '2025-07-13T23:56:04.137Z'
WHERE id = 100;

-- Update escrow 101 with missing columns
UPDATE escrow SET
  custody_end = '2025-07-16T00:01:30.916Z'
WHERE id = 101;

-- Update escrow 102 with missing columns
UPDATE escrow SET
  custody_end = '2025-07-15T17:30:28.626Z'
WHERE id = 102;

-- Update escrow 103 with missing columns
UPDATE escrow SET
  custody_end = '2025-07-14T17:31:18.403Z'
WHERE id = 103;

-- Verification: Check updated columns
SELECT id, smart_contract_escrow_id, custody_end, dispute_status, payment_id
FROM escrow WHERE id <= 10 ORDER BY id;
