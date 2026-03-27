-- 1. Confirm the demo users in auth.users
UPDATE auth.users 
SET email_confirmed_at = now(), 
    confirmed_at = now(),
    last_sign_in_at = now()
WHERE email IN (
    'tristan.lunar@gmail.com',
    'putra.lunar@gmail.com',
    'christian.lunar@gmail.com'
);

-- 2. Update the public.users table to match the IDs from auth.users (if different)
-- Actually, the best way is to DELETE and RE-SEED correctly with the IDs from auth.

-- Let's just create a list of IDs from auth.users and I'll use them in PHP.
SELECT id, email FROM auth.users WHERE email IN ('tristan.lunar@gmail.com', 'putra.lunar@gmail.com', 'christian.lunar@gmail.com');
