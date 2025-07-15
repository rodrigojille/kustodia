-- Test migration: Insert 1 ticket from local to production (using snake_case)
INSERT INTO tickets (id, subject, message, status, "userId", "createdAt", "updatedAt") 
VALUES ('f47f225e-5556-460f-8cbe-f1841cc77b30', 'test', 'test', 'closed', 2, '2025-07-03T17:50:07.593Z', '2025-07-03T18:31:40.075Z') 
ON CONFLICT (id) DO NOTHING;

-- Verify the insert
SELECT id, subject, status, "userId" FROM tickets;
