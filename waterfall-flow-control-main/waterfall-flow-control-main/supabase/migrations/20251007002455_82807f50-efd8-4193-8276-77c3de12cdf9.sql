-- Grant fin app access to guitarbeats@me.com
UPDATE profiles 
SET apps = array_append(apps, 'fin')
WHERE id = 'f2de44c1-7ba3-4335-b224-e8f3b27a73d8';