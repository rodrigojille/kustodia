-- Escrows Migration
TRUNCATE TABLE escrow RESTART IDENTITY CASCADE;

INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        1,
        1,
        NULL,
        NULL,
        NULL,
        0.00,
        0.00,
        1000.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-08T00:38:26.980Z',
        '2025-05-02T00:33:47.388Z',
        '2025-06-17T01:59:47.807Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        2,
        2,
        NULL,
        NULL,
        NULL,
        0.00,
        0.00,
        1000.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-08T00:38:26.980Z',
        '2025-05-02T01:27:29.365Z',
        '2025-06-17T01:59:47.809Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        3,
        3,
        NULL,
        NULL,
        NULL,
        20.00,
        20.00,
        80.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-08T00:38:26.980Z',
        '2025-05-02T01:31:27.678Z',
        '2025-06-17T01:59:47.812Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        4,
        4,
        '0',
        NULL,
        NULL,
        50.00,
        50.50,
        50.50,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-08T00:38:26.980Z',
        '2025-05-03T00:45:14.265Z',
        '2025-06-17T01:59:47.815Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        5,
        5,
        '1',
        NULL,
        NULL,
        50.00,
        50.50,
        50.50,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-08T00:38:26.980Z',
        '2025-05-03T01:34:42.837Z',
        '2025-06-17T01:59:47.787Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        6,
        8,
        '0',
        NULL,
        NULL,
        50.00,
        52.50,
        52.50,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-08T00:38:26.980Z',
        '2025-05-03T23:16:37.399Z',
        '2025-06-17T01:59:47.816Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        7,
        9,
        '1',
        NULL,
        NULL,
        50.00,
        52.50,
        52.50,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-08T00:38:26.980Z',
        '2025-05-03T23:16:43.604Z',
        '2025-06-17T01:59:47.819Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        8,
        13,
        NULL,
        NULL,
        NULL,
        50.00,
        52.50,
        52.50,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-08T00:38:26.980Z',
        '2025-05-03T23:29:55.194Z',
        '2025-06-17T01:59:47.800Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        9,
        14,
        NULL,
        NULL,
        NULL,
        50.00,
        55.00,
        55.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-08T00:38:26.980Z',
        '2025-05-05T21:17:44.176Z',
        '2025-05-05T21:17:44.176Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        10,
        15,
        NULL,
        NULL,
        NULL,
        50.00,
        52.00,
        52.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-08T00:38:26.980Z',
        '2025-05-05T22:37:37.708Z',
        '2025-05-05T22:37:37.708Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        11,
        16,
        NULL,
        NULL,
        NULL,
        50.00,
        52.00,
        52.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-08T00:38:26.980Z',
        '2025-05-06T02:41:16.015Z',
        '2025-05-06T02:41:16.015Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        12,
        17,
        NULL,
        NULL,
        NULL,
        30.00,
        450.00,
        1050.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-08T00:38:26.980Z',
        '2025-05-06T19:08:33.150Z',
        '2025-05-06T19:08:33.150Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        13,
        18,
        NULL,
        NULL,
        NULL,
        50.00,
        52.00,
        52.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-08T00:38:26.980Z',
        '2025-05-06T22:15:34.852Z',
        '2025-05-06T22:15:34.852Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        14,
        19,
        '0',
        '0xb358377b838db621b55b9f8c90c87a5175ee468be6550a1377c4ee6f80476c4a',
        NULL,
        50.00,
        52.00,
        52.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-08T00:38:26.980Z',
        '2025-05-06T22:42:09.015Z',
        '2025-05-23T01:53:47.633Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        15,
        20,
        NULL,
        NULL,
        NULL,
        20.00,
        200.00,
        800.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-19T01:12:05.620Z',
        '2025-05-09T01:12:05.621Z',
        '2025-05-09T01:12:05.621Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        16,
        21,
        NULL,
        NULL,
        NULL,
        50.00,
        750.00,
        750.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-10T04:38:10.216Z',
        '2025-05-10T04:38:00.220Z',
        '2025-05-10T04:38:00.220Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        17,
        22,
        NULL,
        NULL,
        NULL,
        50.00,
        500.00,
        500.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-10T22:36:13.842Z',
        '2025-05-10T22:35:13.843Z',
        '2025-05-10T22:35:13.843Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        18,
        23,
        NULL,
        NULL,
        NULL,
        50.00,
        500.00,
        500.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-10T22:36:29.097Z',
        '2025-05-10T22:35:29.097Z',
        '2025-05-10T22:35:29.097Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        19,
        24,
        '0x7f8561dad5cc3f3ce01db6ee9375892854204f4921486409e7ebb1105041bb33',
        '0x7f8561dad5cc3f3ce01db6ee9375892854204f4921486409e7ebb1105041bb33',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-10T22:40:01.922Z',
        '2025-05-10T22:39:01.922Z',
        '2025-05-23T01:53:47.623Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        20,
        25,
        '0x2675519fae098e1d2b9992e44dd66c36be78069d99e1f91f2c7c9a10359da6ae',
        '0x2675519fae098e1d2b9992e44dd66c36be78069d99e1f91f2c7c9a10359da6ae',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-10T22:40:54.596Z',
        '2025-05-10T22:39:54.597Z',
        '2025-05-23T01:53:47.643Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        21,
        26,
        '0x3dd2898eab5f559f6ced57c15f93db03265522187c4538e50e5fee35f1d49e3b',
        '0x3dd2898eab5f559f6ced57c15f93db03265522187c4538e50e5fee35f1d49e3b',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-10T22:44:05.407Z',
        '2025-05-10T22:43:05.408Z',
        '2025-05-23T01:53:47.614Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        22,
        27,
        '0x406ea3fd5cd5cbe833b23f2826547f827c2b8823c4d6e16fa88b05fc511611c0',
        '0x406ea3fd5cd5cbe833b23f2826547f827c2b8823c4d6e16fa88b05fc511611c0',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-10T22:48:16.148Z',
        '2025-05-10T22:47:16.149Z',
        '2025-05-23T01:53:47.650Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        23,
        28,
        '0x2aed88963dce3aea1541bae405dd2ea0a87a8b9ae087ac1dddc5a201d3835adb',
        '0x2aed88963dce3aea1541bae405dd2ea0a87a8b9ae087ac1dddc5a201d3835adb',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-10T22:50:14.690Z',
        '2025-05-10T22:49:14.690Z',
        '2025-05-23T01:53:47.668Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        24,
        29,
        '0x913665c883ba6f4d15d11ff02296c4214ffb8cf23ab2bc14d64b3e652910d2be',
        '0x913665c883ba6f4d15d11ff02296c4214ffb8cf23ab2bc14d64b3e652910d2be',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'pending',
        'Item not delivered',
        'The item was not delivered as promised.',
        NULL,
        '[{"at":"2025-05-10T22:57:37.212Z","by":3,"action":"raised","reason":"Item not delivered","details":"The item was not delivered as promised.","evidence":null}]'::jsonb,
        '2025-05-10T22:58:18.634Z',
        '2025-05-10T22:57:18.636Z',
        '2025-05-23T01:53:47.660Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        25,
        30,
        '0x58ce52864ea889226bdc0d200e3883e8899385576acaff48f0a37f578a650eff',
        '0x58ce52864ea889226bdc0d200e3883e8899385576acaff48f0a37f578a650eff',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-10T23:00:38.165Z',
        '2025-05-10T23:00:28.166Z',
        '2025-05-23T01:53:47.676Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        26,
        31,
        '0xac0b665ee09299f51218d0d9918806bfd6438684bd53d2ba2520b46dc2fdbd62',
        '0xac0b665ee09299f51218d0d9918806bfd6438684bd53d2ba2520b46dc2fdbd62',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-10T23:03:20.521Z',
        '2025-05-10T23:03:10.521Z',
        '2025-05-23T01:53:47.686Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        27,
        32,
        '0xe19575811eb426d2f4debb6cb51e4d9a03072d34b9ce8b8b60239e0512b041a1',
        '0xe19575811eb426d2f4debb6cb51e4d9a03072d34b9ce8b8b60239e0512b041a1',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-11T04:41:41.486Z',
        '2025-05-11T04:41:31.487Z',
        '2025-05-23T01:53:47.692Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        28,
        33,
        NULL,
        NULL,
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-21T18:45:32.716Z',
        '2025-05-21T18:44:32.717Z',
        '2025-05-21T18:44:32.717Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        29,
        34,
        NULL,
        NULL,
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-21T19:53:23.946Z',
        '2025-05-21T19:52:23.947Z',
        '2025-05-21T19:52:23.947Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        30,
        35,
        NULL,
        NULL,
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-21T19:54:36.130Z',
        '2025-05-21T19:53:36.131Z',
        '2025-05-21T19:53:36.131Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        31,
        36,
        NULL,
        NULL,
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-21T20:07:08.324Z',
        '2025-05-21T20:06:08.325Z',
        '2025-05-21T20:06:08.325Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        32,
        37,
        '0x23d2bf2730280d7223d345084c0c2303ad3b907705edd1b55e50040da9551718',
        '0x23d2bf2730280d7223d345084c0c2303ad3b907705edd1b55e50040da9551718',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T01:40:26.664Z',
        '2025-05-23T01:39:26.666Z',
        '2025-05-23T01:53:47.702Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        33,
        38,
        '0xd854dfb8842614a1e8a547e705f733a23a03825ed1c2319b7048e3129f539ae0',
        '0xd854dfb8842614a1e8a547e705f733a23a03825ed1c2319b7048e3129f539ae0',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T01:58:56.546Z',
        '2025-05-23T01:57:56.546Z',
        '2025-05-23T02:04:00.811Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        34,
        39,
        '0x2e73491a66d9bea277aec6ae08feea3cd67334494b70efe1dc4ea86b4f71b28a',
        '0x2e73491a66d9bea277aec6ae08feea3cd67334494b70efe1dc4ea86b4f71b28a',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T02:02:57.119Z',
        '2025-05-23T02:03:48.374Z',
        '2025-05-23T02:04:00.828Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        35,
        40,
        '0x26ef90995470a14e7e1822af403ba5f182095526cdd3b2fb282c7bb4dedc808f',
        '0x26ef90995470a14e7e1822af403ba5f182095526cdd3b2fb282c7bb4dedc808f',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T02:40:57.020Z',
        '2025-05-23T02:39:57.020Z',
        '2025-05-23T03:54:30.174Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        36,
        41,
        '0x3ddb4a9c4ccdc36bbdce5fcd062b2dd19f1a055837a5a3f1836843a8edabf9c0',
        '0x3ddb4a9c4ccdc36bbdce5fcd062b2dd19f1a055837a5a3f1836843a8edabf9c0',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:27:39.997Z',
        '2025-05-23T03:27:29.998Z',
        '2025-05-23T03:54:30.190Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        37,
        42,
        '0xde0c40559791e38d77acf8e1f9207efdbae974056e75fa0b01b0de400c2cf09d',
        '0xde0c40559791e38d77acf8e1f9207efdbae974056e75fa0b01b0de400c2cf09d',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:34:31.525Z',
        '2025-05-23T03:33:31.527Z',
        '2025-05-23T03:54:30.218Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        38,
        43,
        '0xf432747124f0d39f84c29d1508f220213b8c4305112914bfb10e22d4eef75870',
        '0xf432747124f0d39f84c29d1508f220213b8c4305112914bfb10e22d4eef75870',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:37:44.835Z',
        '2025-05-23T03:36:44.836Z',
        '2025-05-23T03:54:30.233Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        39,
        44,
        '0x395e152df3ba0cfa313fe9ef42c102f054b4a5f1cbf76b88317f53185fe7db35',
        '0x395e152df3ba0cfa313fe9ef42c102f054b4a5f1cbf76b88317f53185fe7db35',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:38:38.593Z',
        '2025-05-23T03:37:38.595Z',
        '2025-05-23T03:54:30.137Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        40,
        45,
        '0xa848b3f0918d6b15afdd947ae72e5e57d61739934428b070ebebff7cbabe5f13',
        '0xa848b3f0918d6b15afdd947ae72e5e57d61739934428b070ebebff7cbabe5f13',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:40:10.085Z',
        '2025-05-23T03:39:10.085Z',
        '2025-05-23T03:54:30.204Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        41,
        46,
        '0x5ddf6688a9741a0ad1c980d40d07e9157a4096f594006f44117be644c7303a25',
        '0x5ddf6688a9741a0ad1c980d40d07e9157a4096f594006f44117be644c7303a25',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:41:28.810Z',
        '2025-05-23T03:40:28.810Z',
        '2025-05-23T03:54:30.246Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        42,
        47,
        '0x44ecd4b794653a64e87879b9c060e93a790cfebd9e97f5d9774532c101b729b1',
        '0x44ecd4b794653a64e87879b9c060e93a790cfebd9e97f5d9774532c101b729b1',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:42:19.994Z',
        '2025-05-23T03:41:19.995Z',
        '2025-05-23T03:54:30.263Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        43,
        48,
        '0xee3a48632ee9f7bdf121429110f33d54de6c0802d8614d90e67ba1447f6d3b34',
        '0xee3a48632ee9f7bdf121429110f33d54de6c0802d8614d90e67ba1447f6d3b34',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:43:12.242Z',
        '2025-05-23T03:42:12.243Z',
        '2025-05-23T03:54:30.276Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        44,
        49,
        '0x8c423a0a06908a7f5ad33f80aa7e42e2abc90f9fef76647c4b59893ddc442ccb',
        '0x8c423a0a06908a7f5ad33f80aa7e42e2abc90f9fef76647c4b59893ddc442ccb',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:51:57.582Z',
        '2025-05-23T03:50:57.583Z',
        '2025-05-23T03:54:30.158Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        45,
        50,
        '0x7e448111fbfb1fa5b860d4394c9ecd66c2a40939d01abfdb1e532fc8d8d32da4',
        '0x7e448111fbfb1fa5b860d4394c9ecd66c2a40939d01abfdb1e532fc8d8d32da4',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:53:58.250Z',
        '2025-05-23T03:52:58.250Z',
        '2025-05-23T03:54:30.288Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        46,
        51,
        NULL,
        NULL,
        NULL,
        0.00,
        0.00,
        1000.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:53:14.627Z',
        '2025-05-23T03:53:14.628Z',
        '2025-05-23T03:53:14.628Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        47,
        52,
        '0x1965c388f91bd884769c0f3d3017e551a8b9c66b34dd3dca4bb89825a7c6a422',
        '0x1965c388f91bd884769c0f3d3017e551a8b9c66b34dd3dca4bb89825a7c6a422',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:55:18.099Z',
        '2025-05-23T03:54:18.099Z',
        '2025-05-23T03:57:17.986Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        48,
        53,
        NULL,
        NULL,
        NULL,
        0.00,
        0.00,
        1000.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:54:30.368Z',
        '2025-05-23T03:54:30.368Z',
        '2025-05-23T03:54:30.368Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        49,
        54,
        '0x5edba34a7b26deeafa93d74755ce593748866c57b9a626b1443ce8b76592e46c',
        '0x5edba34a7b26deeafa93d74755ce593748866c57b9a626b1443ce8b76592e46c',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:56:13.942Z',
        '2025-05-23T03:57:04.556Z',
        '2025-05-23T03:57:17.963Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        50,
        55,
        NULL,
        NULL,
        NULL,
        0.00,
        0.00,
        1000.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:57:18.069Z',
        '2025-05-23T03:57:18.069Z',
        '2025-05-23T03:57:18.069Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        51,
        56,
        '0x07d06f1ed127087278ee0a367d1f4dbfb4f9c757ebf997eb7641b9e36f459dc1',
        '0x07d06f1ed127087278ee0a367d1f4dbfb4f9c757ebf997eb7641b9e36f459dc1',
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:56:32.537Z',
        '2025-05-23T03:57:24.592Z',
        '2025-05-23T03:57:36.631Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        52,
        57,
        NULL,
        NULL,
        NULL,
        0.00,
        0.00,
        1000.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-23T03:57:36.714Z',
        '2025-05-23T03:57:36.714Z',
        '2025-05-23T03:57:36.714Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        53,
        58,
        NULL,
        NULL,
        NULL,
        50.00,
        500.00,
        500.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-22T06:00:00.000Z',
        '2025-05-23T12:07:39.096Z',
        '2025-06-17T01:59:47.830Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        54,
        59,
        NULL,
        NULL,
        NULL,
        100.00,
        1500.00,
        0.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-25T21:53:05.068Z',
        '2025-05-25T21:53:04.070Z',
        '2025-05-25T21:53:04.070Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        55,
        60,
        NULL,
        NULL,
        NULL,
        100.00,
        2000.00,
        0.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-28T23:18:22.421Z',
        '2025-05-25T23:18:22.423Z',
        '2025-05-25T23:18:22.423Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        56,
        61,
        NULL,
        '0x3b2e7dd88c73338370d001d90345c6b1ca4af659b2b4a145615ae10bab735fd0',
        NULL,
        100.00,
        2000.00,
        0.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-05-28T23:28:00.726Z',
        '2025-05-25T23:28:00.727Z',
        '2025-05-27T23:11:23.412Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        57,
        69,
        NULL,
        NULL,
        NULL,
        50.00,
        500.00,
        500.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-06-09T14:54:51.260Z',
        '2025-06-07T14:54:51.262Z',
        '2025-06-07T14:54:51.262Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        58,
        70,
        NULL,
        NULL,
        NULL,
        50.00,
        1000.00,
        1000.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-06-12T17:05:54.239Z',
        '2025-06-07T17:05:54.239Z',
        '2025-06-07T17:05:54.239Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        59,
        71,
        '1',
        '0xc3d13d1bdf92e8c056bb7657786fde56e276c465ba32b553b95829919b228133',
        '0xc8b0422b33...',
        50.00,
        1000.00,
        1000.00,
        'completed',
        'pending',
        'test',
        'test',
        '{"/uploads/evidence/1749422289168-731210727-Kustodia_by_Czentral_(10).pdf"}',
        '[{"at":"2025-06-08T22:38:09.225Z","by":2,"action":"raised","reason":"test","details":"test","evidence":["/uploads/evidence/1749422289168-731210727-Kustodia_by_Czentral_(10).pdf"]}]'::jsonb,
        '2025-06-12T17:35:55.097Z',
        '2025-06-07T17:35:55.098Z',
        '2025-06-23T22:21:57.544Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        60,
        72,
        NULL,
        NULL,
        NULL,
        20.00,
        2000.00,
        8000.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-06-19T00:20:08.107Z',
        '2025-06-12T00:20:08.108Z',
        '2025-06-12T00:20:08.108Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        61,
        73,
        '2',
        '0x59540ead7978f862f8ce4466eb38d2a516c9d991e8f6ed43fd8ae4b3a6c648ad',
        '0x9d8cc8483db87ae5527e2ca70fa2e622b9a80e8fbc9e729be13af41bd7dc99fd',
        50.00,
        2500.00,
        2500.00,
        'completed',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-06-17T00:22:37.021Z',
        '2025-06-12T00:22:37.022Z',
        '2025-06-23T22:21:57.564Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        62,
        74,
        NULL,
        NULL,
        NULL,
        50.00,
        500.00,
        500.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-06-16T01:52:40.412Z',
        '2025-06-14T01:52:40.413Z',
        '2025-06-14T01:52:40.413Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        63,
        75,
        NULL,
        NULL,
        NULL,
        50.00,
        500.00,
        500.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-06-16T02:01:48.732Z',
        '2025-06-14T02:01:48.735Z',
        '2025-06-14T02:01:48.735Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        64,
        76,
        NULL,
        NULL,
        NULL,
        50.00,
        250.00,
        250.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-06-16T23:38:23.249Z',
        '2025-06-16T23:38:23.249Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        65,
        77,
        NULL,
        NULL,
        NULL,
        50.00,
        250.00,
        250.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-06-16T23:46:51.270Z',
        '2025-06-16T23:46:51.270Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        66,
        78,
        NULL,
        NULL,
        NULL,
        50.00,
        250.00,
        250.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-06-16T23:50:54.511Z',
        '2025-06-16T23:50:54.511Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        67,
        79,
        NULL,
        NULL,
        NULL,
        50.00,
        250.00,
        250.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-06-17T00:02:12.061Z',
        '2025-06-17T00:02:12.061Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        68,
        80,
        NULL,
        NULL,
        NULL,
        50.00,
        500.00,
        500.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-06-17T00:16:14.718Z',
        '2025-06-17T00:16:14.718Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        69,
        81,
        '{"type":"BigNumber","hex":"0x01"}',
        '0x605519dbd29bafdab81933238c49978c2c1cdbc041ff2b1b235e243cf0ed6112',
        'smart_contract_escrow_released',
        50.00,
        1000.00,
        1000.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-06-18T19:44:49.375Z',
        '2025-06-17T19:44:49.375Z',
        '2025-06-18T01:36:26.393Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        70,
        82,
        NULL,
        NULL,
        NULL,
        50.00,
        500.00,
        500.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-06-19T21:42:46.000Z',
        '2025-06-17T21:42:46.339Z',
        '2025-06-17T21:42:46.339Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        71,
        83,
        '3',
        '0x564b84efbf446ef3e3d802e38b0f3b5dce92f32d1bf3daf21859673f0e7d468b',
        'auto-released-1750866603184',
        100.00,
        1000.00,
        0.00,
        'completed',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-06-25T03:10:21.132Z',
        '2025-06-23T03:10:21.133Z',
        '2025-06-26T20:22:26.902Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        72,
        84,
        '4',
        '0x7c984b5747d0aac591e0fd01fa4ad4e326060e7349adc1ca3d365fb478cc32fd',
        NULL,
        100.00,
        5000.00,
        0.00,
        'cancelled',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-01T23:02:43.777Z',
        '2025-06-24T23:02:43.782Z',
        '2025-07-02T21:52:54.093Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        73,
        85,
        '1',
        '0x520cb8c866671a9497ee81df15de5fe688d608b36afab5bc4f46c99e1eb30ce1',
        NULL,
        100.00,
        1000.00,
        0.00,
        'completed',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-06T02:10:33.000Z',
        '2025-07-04T00:58:38.990Z',
        '2025-07-09T23:40:20.257Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        74,
        86,
        NULL,
        NULL,
        NULL,
        50.00,
        500.00,
        500.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-06T16:02:00.436Z',
        '2025-07-04T16:02:00.437Z',
        '2025-07-04T16:02:00.437Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        75,
        87,
        '3',
        '0x8b139b4a39132d2aac241fdc5af76b87b589a168db58da96d10c9d821fdcd3fd',
        NULL,
        50.00,
        500.00,
        500.00,
        'completed',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-06T16:59:45.519Z',
        '2025-07-04T16:59:45.522Z',
        '2025-07-09T23:40:12.215Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        76,
        88,
        '4',
        '0x40346b2b6e108b6f433b6878d497987f3b890785e1bae11aa5a374973af9c9be',
        'auto-paid-1751921810231',
        50.00,
        500.00,
        500.00,
        'completed',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-05T22:50:25.041Z',
        '2025-07-04T22:50:25.041Z',
        '2025-07-07T20:56:50.249Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        77,
        89,
        '5',
        '0x7b7e4a94c523f2d5e62ca9f3ce8c07f17e183c5ff1b1520598f10f4e918fef54',
        'manual-recovery-c67ea8ed-47a4-4c83-94fe-4e6d8354aa88',
        100.00,
        5000.00,
        0.00,
        'completed',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-09T22:24:48.075Z',
        '2025-07-07T22:24:48.076Z',
        '2025-07-09T22:53:15.666Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        78,
        90,
        '6',
        '0xac418864b7aebb0e17c764c5ff015d6b8bf74e5524e80eb5b554c8895e5f0ccb',
        '0x636d426615560139516d8a6909792204134053af4829797956e4d797e2c2510',
        100.00,
        30000.00,
        0.00,
        'completed',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-11T00:11:46.914Z',
        '2025-07-08T00:11:46.915Z',
        '2025-07-11T00:44:18.715Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        81,
        null,
        NULL,
        NULL,
        NULL,
        100.00,
        100.00,
        0.00,
        'pending_creation',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-10T00:33:03.876Z',
        '2025-07-09T00:33:03.880Z',
        '2025-07-09T00:33:03.880Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        82,
        null,
        NULL,
        NULL,
        NULL,
        100.00,
        100.00,
        0.00,
        'pending_creation',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-10T00:41:04.528Z',
        '2025-07-09T00:41:04.531Z',
        '2025-07-09T00:41:04.531Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        83,
        null,
        NULL,
        NULL,
        NULL,
        100.00,
        100.00,
        0.00,
        'pending_creation',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-10T01:00:31.590Z',
        '2025-07-09T01:00:31.595Z',
        '2025-07-09T01:00:31.595Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        84,
        null,
        '0',
        NULL,
        NULL,
        100.00,
        100.00,
        0.00,
        'funded',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-10T03:55:06.025Z',
        '2025-07-09T03:55:06.029Z',
        '2025-07-09T03:55:06.029Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        85,
        null,
        '0',
        NULL,
        NULL,
        100.00,
        100.00,
        0.00,
        'funded',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-10T04:02:24.580Z',
        '2025-07-09T04:02:24.583Z',
        '2025-07-09T04:02:24.583Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        91,
        104,
        NULL,
        NULL,
        NULL,
        100.00,
        1000.00,
        1000.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-17T19:38:32.042Z',
        '2025-07-12T19:38:32.043Z',
        '2025-07-12T19:38:32.043Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        92,
        105,
        NULL,
        NULL,
        NULL,
        100.00,
        1000.00,
        0.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-12T19:44:51.393Z',
        '2025-07-12T19:44:50.394Z',
        '2025-07-12T19:44:50.394Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        93,
        106,
        NULL,
        NULL,
        NULL,
        100.00,
        1000.00,
        0.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-12T21:25:25.603Z',
        '2025-07-12T21:25:24.604Z',
        '2025-07-12T21:25:24.604Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        94,
        107,
        NULL,
        NULL,
        NULL,
        100.00,
        1000.00,
        0.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-12T21:29:47.312Z',
        '2025-07-12T21:29:46.316Z',
        '2025-07-12T21:29:46.316Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        95,
        108,
        NULL,
        NULL,
        NULL,
        100.00,
        100.00,
        0.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-12T21:36:43.473Z',
        '2025-07-12T21:36:42.474Z',
        '2025-07-12T21:36:42.474Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        96,
        109,
        NULL,
        NULL,
        NULL,
        100.00,
        100.00,
        0.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-12T21:38:27.603Z',
        '2025-07-12T21:38:26.605Z',
        '2025-07-12T21:38:26.605Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        97,
        110,
        '7',
        '0x59dbca8157b98f82df5d8f6c18c4e9c0d0c9c416a9d461928fcd9b94021fb1ee',
        '0x5e526f473fbe83a4df76e6be737a511f3e00acc04884e88232c6647deaed794d',
        100.00,
        1000.00,
        0.00,
        'completed',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-13T21:51:38.267Z',
        '2025-07-12T21:51:38.267Z',
        '2025-07-13T22:28:17.632Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        98,
        111,
        '8',
        '0x839191f8dfd7d420d71d2f40a777457737e1ca660c8ebbe1cf107bcb0c493375',
        '0x09e09f062d9e73030d7457d5af0670e0fe5225b63023e187ede5bd9b93509d78',
        100.00,
        1000.00,
        0.00,
        'completed',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-13T22:41:48.985Z',
        '2025-07-12T22:41:48.985Z',
        '2025-07-13T22:52:18.602Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        99,
        112,
        '9',
        '0x63712a0d731c782349065b689868e5f750858f33782ee78b38932e907ae36e80',
        NULL,
        100.00,
        10000.00,
        0.00,
        'active',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-13T23:42:03.911Z',
        '2025-07-12T23:31:38.367Z',
        '2025-07-12T23:45:11.019Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        100,
        113,
        '10',
        '0xbb7970d7149473365bc6ed6f0bfd77b25009f83a96b2ae0482ead6465cd95b43',
        NULL,
        100.00,
        1000.00,
        0.00,
        'active',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-13T23:56:04.137Z',
        '2025-07-12T23:56:04.137Z',
        '2025-07-13T00:05:31.910Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        101,
        114,
        NULL,
        NULL,
        NULL,
        100.00,
        1000.00,
        0.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-16T00:01:30.916Z',
        '2025-07-14T00:01:30.916Z',
        '2025-07-14T00:01:30.929Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        102,
        115,
        NULL,
        NULL,
        NULL,
        100.00,
        1000.00,
        0.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-15T17:30:28.626Z',
        '2025-07-14T17:30:28.626Z',
        '2025-07-14T17:30:28.640Z'
      );
INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        103,
        116,
        NULL,
        NULL,
        NULL,
        100.00,
        1000.00,
        0.00,
        'pending',
        'none',
        NULL,
        NULL,
        NULL,
        NULL,
        '2025-07-14T17:31:18.403Z',
        '2025-07-14T17:31:17.403Z',
        '2025-07-14T17:31:17.415Z'
      );

-- Reset sequence
SELECT setval('escrow_id_seq', (SELECT MAX(id) FROM escrow));

-- Verification
SELECT id, payment_id, smart_contract_escrow_id, custody_amount, release_amount, status, dispute_status FROM escrow ORDER BY id;
