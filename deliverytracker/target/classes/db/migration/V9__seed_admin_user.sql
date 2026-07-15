-- V9: Seed Default Admin User
-- Password is 'Password123' (hashed using BCrypt)
INSERT INTO users (full_name, email, password, role, is_active, created_at, updated_at)
VALUES (
  'System Admin', 
  'admin@example.com', 
  '$2a$10$8.ZpG9SqxPy3x.DszW/Ld.d65nZ2Z3h9B4/cT.Xg9N3zZtGv6v0yO', 
  'ADMIN', 
  TRUE, 
  CURRENT_TIMESTAMP, 
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;
