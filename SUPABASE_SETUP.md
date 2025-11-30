# 🔑 Supabase Setup Guide

## Step 1: Get Your Supabase Keys

1. Go to https://app.supabase.com
2. Select your project (or create a new one)
3. Click on **Settings** (gear icon in sidebar)
4. Click on **API** in the settings menu
5. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long key starting with `eyJ...`)

## Step 2: Create `.env.local` File

In your project root, create a file called `.env.local` and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace** the values with your actual Supabase URL and key.

## Step 3: Restart Dev Server

```bash
npm run dev
```

## ✅ Verification

To test if Supabase is connected, you can add this to any component:

```tsx
import { supabase } from '@/lib/supabase/client'

// Test connection
const { data, error } = await supabase.from('your_table').select('*')
```

## 🔒 Security Notes

- ✅ `.env.local` is already in `.gitignore` - your keys won't be committed
- ✅ The `NEXT_PUBLIC_` prefix makes these available in the browser (safe for anon key)
- ❌ Never commit `.env.local` to Git
- ❌ Never share your service_role key (only use anon key in frontend)

## Next Steps

Once connected, you can:
1. Create database tables in Supabase dashboard
2. Add authentication (login/signup)
3. Fetch real data for dashboard stats
4. Store user preferences
