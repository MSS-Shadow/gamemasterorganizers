-- Delete test users without profiles
DELETE FROM auth.users WHERE email IN ('testplayer2026@test.com', 'testplayer2@test.com', 'testplayer3@test.com', 'newuser2026@test.com');

-- Create profile for admin if not exists
INSERT INTO public.profiles (user_id, email, nickname, player_id, platform, country, clan, status, verified)
SELECT id, 'portadormato@gmail.com', 'ShadowX', 'ADMIN001', 'PC', 'LATAM', '', 'active', true
FROM auth.users WHERE email = 'portadormato@gmail.com'
ON CONFLICT (user_id) DO NOTHING;