-- V10: Update pre-seeded admin and agent passwords to a valid BCrypt hash of 'Password123'
UPDATE users 
SET password = '$2a$10$n4U42bWkkv/GjSF27OnMSeED.pzBjWFEHDJOpGrmiTJMQXHEFU1h.' 
WHERE email IN ('admin@example.com', 'agent@example.com');
