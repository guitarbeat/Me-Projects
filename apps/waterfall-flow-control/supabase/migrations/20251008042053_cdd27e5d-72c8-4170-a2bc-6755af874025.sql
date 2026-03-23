-- Use the existing merge_user_accounts function to properly merge the accounts
-- This will transfer all fin_transactions from the authenticated user to the 'aaron' profile
-- and update the profile to use the new authenticated user ID

-- First, transfer the transactions to the old user ID temporarily
UPDATE public.fin_transactions
SET user_id = 'dfa22114-e59a-431f-8821-de2ac82cc81f'
WHERE user_id = 'f2de44c1-7ba3-4335-b224-e8f3b27a73d8';

-- Now call the merge function which will properly merge everything
SELECT public.merge_user_accounts('aaron', 'f2de44c1-7ba3-4335-b224-e8f3b27a73d8');