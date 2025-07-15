-- Ticket Replies Migration SQL
-- Generated on 2025-07-15T00:58:06.514Z
-- Total ticket replies: 2

INSERT INTO ticket_replies (
        id, 
        message, 
        "createdAt", 
        "ticketId", 
        "userId"
      ) VALUES (
        'd313dc06-5af1-4aca-b4b0-640b82d37031',
        'Hola, no puedo cambiar mi clabe de retiro',
        '2025-07-03T18:05:42.793Z',
        'f47f225e-5556-460f-8cbe-f1841cc77b30',
        2
      );

INSERT INTO ticket_replies (
        id, 
        message, 
        "createdAt", 
        "ticketId", 
        "userId"
      ) VALUES (
        'c0394106-2c6d-493e-92a7-5c1df8f5fa3f',
        'hola',
        '2025-07-03T18:26:53.093Z',
        'f47f225e-5556-460f-8cbe-f1841cc77b30',
        2
      );


-- Verification queries
SELECT 
  COUNT(*) as total_replies,
  COUNT(DISTINCT "ticketId") as tickets_with_replies,
  COUNT(DISTINCT "userId") as users_with_replies
FROM ticket_replies;

-- Show all replies with ticket and user info
SELECT 
  tr.id, 
  tr.message, 
  tr."createdAt", 
  tr."ticketId", 
  tr."userId"
FROM ticket_replies tr
ORDER BY tr."createdAt" DESC;

-- Check foreign key relationships exist
SELECT 
  tr.id as reply_id,
  t.id as ticket_exists,
  u.id as user_exists
FROM ticket_replies tr
LEFT JOIN tickets t ON t.id = tr."ticketId"
LEFT JOIN "user" u ON u.id = tr."userId"
ORDER BY tr."createdAt";
