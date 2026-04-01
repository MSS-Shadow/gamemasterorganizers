

# Plan: Fix All Build Errors

The project has multiple build errors across 6 files. The root causes are: a missing database table (`clan_join_requests`), a missing database column (`is_clan_leader`), missing imports, and incorrect API usage.

---

## Step 1: Create `clan_join_requests` table (database migration)

The code in `Auth.tsx`, `ClanPage.tsx`, and `Teams.tsx` references a `clan_join_requests` table that doesn't exist. Create it:

```sql
CREATE TABLE public.clan_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nickname TEXT NOT NULL,
  player_id TEXT NOT NULL,
  clan_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.clan_join_requests ENABLE ROW LEVEL SECURITY;
```

Add appropriate RLS policies for authenticated users.

---

## Step 2: Add `is_clan_leader` column to profiles

```sql
ALTER TABLE public.profiles ADD COLUMN is_clan_leader BOOLEAN DEFAULT false;
```

---

## Step 3: Fix `src/pages/Index.tsx`

Remove `.catch()` calls on Supabase query builders (they don't support `.catch()`). Wrap each query in a try/catch or handle errors via the response object instead.

---

## Step 4: Fix `src/pages/Profile.tsx`

- Add missing import: `ShieldCheck` from `lucide-react`
- Fix platform type cast: `(profile.platform as "PC" | "Mobile") || "Mobile"`

---

## Step 5: Fix `src/pages/ResetPassword.tsx`

- Add missing import: `Link` from `react-router-dom`
- Remove `supabase.auth.stop()` call (doesn't exist in the SDK)

---

## Step 6: Fix `src/pages/Teams.tsx`

- Add `CardFooter` to the import from `@/components/ui/card`

---

## Summary of changes

| File | Fix |
|------|-----|
| Database | Create `clan_join_requests` table + add `is_clan_leader` to profiles |
| `Index.tsx` | Remove `.catch()` on query builders |
| `Profile.tsx` | Import `ShieldCheck`, fix platform type |
| `ResetPassword.tsx` | Import `Link`, remove `auth.stop()` |
| `Teams.tsx` | Import `CardFooter` |

