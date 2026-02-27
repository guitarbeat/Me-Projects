-- Update password for the personal journal user
UPDATE auth.users 
SET encrypted_password = crypt('1234asdf', gen_salt('bf'))
WHERE email = 'personal@journal.app';