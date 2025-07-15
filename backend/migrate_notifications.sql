-- Notification Migration SQL
-- Generated on 2025-07-15T00:54:16.035Z
-- Total notifications: 44

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        1,
        null,
        'Tu pago ha sido creado exitosamente - Pago #88',
        '/dashboard/pagos/88',
        NULL,
        NULL,
        true,
        NULL,
        '2025-07-04T22:50:25.076Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        2,
        null,
        'El pago ha sido liberado y transferido - Pago #88',
        '/dashboard/pagos/88',
        NULL,
        NULL,
        true,
        NULL,
        '2025-07-07T20:56:50.278Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        3,
        null,
        'El pago ha sido liberado y transferido - Pago #88',
        '/dashboard/pagos/88',
        NULL,
        NULL,
        true,
        NULL,
        '2025-07-07T20:56:50.284Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        4,
        null,
        'Tu pago ha sido creado exitosamente - Pago #89',
        '/dashboard/pagos/89',
        NULL,
        NULL,
        true,
        NULL,
        '2025-07-07T22:24:48.115Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        5,
        null,
        'Los fondos han sido recibidos en la custodia - Pago #89',
        '/dashboard/pagos/89',
        NULL,
        NULL,
        true,
        NULL,
        '2025-07-07T22:44:00.615Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        6,
        null,
        'La custodia ha sido creada y está activa - Pago #89',
        '/dashboard/pagos/89',
        NULL,
        NULL,
        true,
        NULL,
        '2025-07-07T22:44:52.131Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        7,
        null,
        'Tu pago ha sido creado exitosamente - Pago #90',
        '/dashboard/pagos/90',
        NULL,
        NULL,
        true,
        NULL,
        '2025-07-08T00:11:46.948Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        8,
        null,
        'Los fondos han sido recibidos en la custodia - Pago #90',
        '/dashboard/pagos/90',
        NULL,
        NULL,
        true,
        NULL,
        '2025-07-08T00:21:00.455Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        9,
        null,
        'La custodia ha sido creada y está activa - Pago #90',
        '/dashboard/pagos/90',
        NULL,
        NULL,
        true,
        NULL,
        '2025-07-08T00:37:08.033Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        10,
        null,
        'Tu pago ha sido fondeado en la custodia on-chain exitosamente - Pago #94',
        '/dashboard/pagos/94',
        NULL,
        NULL,
        true,
        NULL,
        '2025-07-09T03:55:06.094Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        11,
        null,
        'Tu pago ha sido fondeado en la custodia on-chain exitosamente - Pago #95',
        '/dashboard/pagos/95',
        NULL,
        NULL,
        true,
        NULL,
        '2025-07-09T04:02:24.630Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        12,
        3,
        'Nuevo pago recibido',
        'Has recibido un pago de 1000 MXN de Rodrigo Jimenez',
        'success',
        'payment',
        false,
        104,
        '2025-07-12T19:38:32.104Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        13,
        3,
        'Nuevo pago recibido',
        'Has recibido un pago de 1000 MXN de Rodrigo Jimenez',
        'success',
        'payment',
        false,
        105,
        '2025-07-12T19:44:50.446Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        14,
        3,
        'Nuevo pago recibido',
        'Has recibido un pago de 1000 MXN de Rodrigo Jimenez',
        'success',
        'payment',
        false,
        106,
        '2025-07-12T21:25:24.666Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        15,
        3,
        'Nuevo pago recibido',
        'Has recibido un pago de 1000 MXN de Rodrigo Jimenez',
        'success',
        'payment',
        false,
        107,
        '2025-07-12T21:29:46.371Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        16,
        3,
        'Nuevo pago recibido',
        'Has recibido un pago de 100 MXN de Rodrigo Jimenez',
        'success',
        'payment',
        false,
        108,
        '2025-07-12T21:36:42.512Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        17,
        3,
        'Nuevo pago recibido',
        'Has recibido un pago de 100 MXN de Rodrigo Jimenez',
        'success',
        'payment',
        false,
        109,
        '2025-07-12T21:38:26.650Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        18,
        3,
        'Nuevo pago recibido',
        'Has recibido un pago de 1000 MXN de Rodrigo Jimenez',
        'success',
        'payment',
        false,
        110,
        '2025-07-12T21:51:38.330Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        19,
        2,
        'Los fondos han sido recibidos en la custodia - Pago #110',
        '/dashboard/pagos/110',
        'success',
        'payment',
        true,
        110,
        '2025-07-12T22:22:00.573Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        20,
        3,
        'Los fondos han sido recibidos en la custodia - Pago #110',
        '/dashboard/pagos/110',
        'success',
        'payment',
        false,
        110,
        '2025-07-12T22:22:00.580Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        21,
        2,
        'La custodia ha sido creada y está activa - Pago #110',
        '/dashboard/pagos/110',
        'info',
        'payment',
        false,
        110,
        '2025-07-12T22:40:01.457Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        22,
        3,
        'La custodia ha sido creada y está activa - Pago #110',
        '/dashboard/pagos/110',
        'info',
        'payment',
        false,
        110,
        '2025-07-12T22:40:01.465Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        23,
        3,
        'Nuevo pago recibido',
        'Has recibido un pago de 1000 MXN de Rodrigo Jimenez',
        'success',
        'payment',
        false,
        111,
        '2025-07-12T22:41:49.051Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        24,
        2,
        'Los fondos han sido recibidos en la custodia - Pago #111',
        '/dashboard/pagos/111',
        'success',
        'payment',
        false,
        111,
        '2025-07-12T22:43:00.451Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        25,
        3,
        'Los fondos han sido recibidos en la custodia - Pago #111',
        '/dashboard/pagos/111',
        'success',
        'payment',
        false,
        111,
        '2025-07-12T22:43:00.457Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        26,
        2,
        'La custodia ha sido creada y está activa - Pago #111',
        '/dashboard/pagos/111',
        'info',
        'payment',
        false,
        111,
        '2025-07-12T22:43:28.296Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        27,
        3,
        'La custodia ha sido creada y está activa - Pago #111',
        '/dashboard/pagos/111',
        'info',
        'payment',
        false,
        111,
        '2025-07-12T22:43:28.301Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        28,
        3,
        'Nuevo pago recibido',
        'Has recibido un pago de 10000 MXN de Rodrigo Jimenez',
        'success',
        'payment',
        false,
        112,
        '2025-07-12T23:31:38.443Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        29,
        2,
        'Los fondos han sido recibidos en la custodia - Pago #112',
        '/dashboard/pagos/112',
        'success',
        'payment',
        false,
        112,
        '2025-07-12T23:35:00.424Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        30,
        3,
        'Los fondos han sido recibidos en la custodia - Pago #112',
        '/dashboard/pagos/112',
        'success',
        'payment',
        false,
        112,
        '2025-07-12T23:35:00.434Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        31,
        2,
        'La custodia ha sido creada y está activa - Pago #112',
        '/dashboard/pagos/112',
        'info',
        'payment',
        false,
        112,
        '2025-07-12T23:45:11.063Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        32,
        3,
        'La custodia ha sido creada y está activa - Pago #112',
        '/dashboard/pagos/112',
        'info',
        'payment',
        false,
        112,
        '2025-07-12T23:45:11.071Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        33,
        3,
        'Nuevo pago recibido',
        'Has recibido un pago de 1000 MXN de Rodrigo Jimenez',
        'success',
        'payment',
        false,
        113,
        '2025-07-12T23:56:04.205Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        34,
        2,
        'Los fondos han sido recibidos en la custodia - Pago #113',
        '/dashboard/pagos/113',
        'success',
        'payment',
        false,
        113,
        '2025-07-13T00:05:00.509Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        35,
        3,
        'Los fondos han sido recibidos en la custodia - Pago #113',
        '/dashboard/pagos/113',
        'success',
        'payment',
        false,
        113,
        '2025-07-13T00:05:00.517Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        36,
        2,
        'La custodia ha sido creada y está activa - Pago #113',
        '/dashboard/pagos/113',
        'info',
        'payment',
        false,
        113,
        '2025-07-13T00:05:31.953Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        37,
        3,
        'La custodia ha sido creada y está activa - Pago #113',
        '/dashboard/pagos/113',
        'info',
        'payment',
        false,
        113,
        '2025-07-13T00:05:31.961Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        38,
        2,
        'El pago ha sido liberado y transferido - Pago #110',
        '/dashboard/pagos/110',
        'success',
        'payment',
        false,
        110,
        '2025-07-13T22:28:17.660Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        39,
        3,
        'El pago ha sido liberado y transferido - Pago #110',
        '/dashboard/pagos/110',
        'success',
        'payment',
        false,
        110,
        '2025-07-13T22:28:17.670Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        40,
        2,
        'El pago ha sido liberado y transferido - Pago #111',
        '/dashboard/pagos/111',
        'success',
        'payment',
        false,
        111,
        '2025-07-13T22:52:18.624Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        41,
        3,
        'El pago ha sido liberado y transferido - Pago #111',
        '/dashboard/pagos/111',
        'success',
        'payment',
        false,
        111,
        '2025-07-13T22:52:18.631Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        42,
        3,
        'Nuevo pago recibido',
        'Has recibido un pago de 1000 MXN de Rodrigo Jimenez',
        'success',
        'payment',
        false,
        114,
        '2025-07-14T00:01:30.998Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        43,
        3,
        'Nuevo pago recibido',
        'Has recibido un pago de 1000 MXN de Rodrigo Jimenez',
        'success',
        'payment',
        false,
        115,
        '2025-07-14T17:30:28.714Z'
      );

INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        44,
        3,
        'Nuevo pago recibido',
        'Has recibido un pago de 1000 MXN de Rodrigo Jimenez',
        'success',
        'payment',
        false,
        116,
        '2025-07-14T17:31:17.460Z'
      );


-- Update sequence
SELECT setval('notification_id_seq', 45, false);

-- Verification query
SELECT 
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN read = true THEN 1 END) as read_notifications,
  COUNT(CASE WHEN read = false THEN 1 END) as unread_notifications,
  COUNT(CASE WHEN payment_id IS NOT NULL THEN 1 END) as payment_related_notifications
FROM notification;

-- Show sample data
SELECT id, user_id, message, type, category, read, payment_id, "createdAt" 
FROM notification 
ORDER BY "createdAt" DESC 
LIMIT 10;
