-- Transfer all transactions from the old anonymous account to the guitarbeats account
UPDATE public.fin_transactions
SET user_id = 'f2de44c1-7ba3-4335-b224-e8f3b27a73d8'
WHERE user_id = 'dfa22114-e59a-431f-8821-de2ac82cc81f';