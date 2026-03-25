-- Migrate existing transactions to the authenticated user (guitarbeats@me.com)
-- User ID: f2de44c1-7ba3-4335-b224-e8f3b27a73d8

UPDATE fin_transactions 
SET user_id = 'f2de44c1-7ba3-4335-b224-e8f3b27a73d8'
WHERE user_id = '677aa256-c59e-41c7-8b1e-ae352a95f28e';