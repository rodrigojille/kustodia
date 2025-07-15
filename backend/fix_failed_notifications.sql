-- Fix Failed Notifications SQL
-- Generated on 2025-07-15T00:55:59.099Z
-- Notifications with NULL values that need default values

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
        1,
        'Tu pago ha sido creado exitosamente - Pago #88',
        '/dashboard/pagos/88',
        'success',
        'payment',
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
        1,
        'El pago ha sido liberado y transferido - Pago #88',
        '/dashboard/pagos/88',
        'success',
        'payment',
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
        1,
        'El pago ha sido liberado y transferido - Pago #88',
        '/dashboard/pagos/88',
        'success',
        'payment',
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
        1,
        'Tu pago ha sido creado exitosamente - Pago #89',
        '/dashboard/pagos/89',
        'success',
        'payment',
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
        1,
        'Los fondos han sido recibidos en la custodia - Pago #89',
        '/dashboard/pagos/89',
        'success',
        'payment',
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
        1,
        'La custodia ha sido creada y está activa - Pago #89',
        '/dashboard/pagos/89',
        'info',
        'payment',
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
        1,
        'Tu pago ha sido creado exitosamente - Pago #90',
        '/dashboard/pagos/90',
        'success',
        'payment',
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
        1,
        'Los fondos han sido recibidos en la custodia - Pago #90',
        '/dashboard/pagos/90',
        'success',
        'payment',
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
        1,
        'La custodia ha sido creada y está activa - Pago #90',
        '/dashboard/pagos/90',
        'info',
        'payment',
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
        1,
        'Tu pago ha sido fondeado en la custodia on-chain exitosamente - Pago #94',
        '/dashboard/pagos/94',
        'info',
        'payment',
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
        1,
        'Tu pago ha sido fondeado en la custodia on-chain exitosamente - Pago #95',
        '/dashboard/pagos/95',
        'info',
        'payment',
        true,
        NULL,
        '2025-07-09T04:02:24.630Z'
      );

