# Environment Setup Guide

## Security Notice

⚠️ **IMPORTANT**: Never commit API keys or sensitive credentials to version control!

## Current Setup

The app is now configured to use **Vercel environment variables** for production and local `.env.local` files for development. This is the most secure approach.

## Environment Variables Configuration

### ✅ **Vercel Production (Already Configured)**

Your Vercel project `cycle-buddy-calendar` already has both environment variables set:

- `VITE_SUPABASE_URL` = `[YOUR_SUPABASE_URL]`
- `VITE_SUPABASE_ANON_KEY` = `[Encrypted]`

### 🔧 **Local Development**

For local development, create a `.env.local` file in your project root:

```bash
VITE_SUPABASE_URL=[YOUR_SUPABASE_URL]
VITE_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
```

> **Note:** `VITE_SUPABASE_URL` must use your project's API endpoint (`https://<project-ref>.supabase.co`).
> Using the Supabase dashboard URL will cause requests to fail with CORS errors.

**Note**: The `.env.local` file is already gitignored for security.

## Your Supabase Credentials

- **Project URL**: Can be found in your Supabase dashboard settings.
- **Project ID**: Can be found in your Supabase dashboard settings.
- **Anonymous Key**: Check your Supabase dashboard

## Files to Update

- `.env.local` - Local development environment variables (gitignored)
- `vercel.json` - Vercel configuration (auto-generated)
- `.vercel/` - Vercel project link (auto-generated)

## Security Best Practices

1. ✅ Use environment variables in production
2. ✅ Never commit `.env` or `config.js` files
3. ✅ Rotate API keys regularly
4. ✅ Use least-privilege access for database roles
5. ✅ Enable Row Level Security (RLS) in Supabase
