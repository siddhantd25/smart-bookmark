# Smart Bookmark App

A production-ready fullstack bookmark manager built with Next.js App Router, Supabase, and Tailwind CSS. Features Google OAuth authentication, real-time updates, and complete data isolation.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Supabase Auth
- 📚 **Bookmark Management** - Add, view, and delete bookmarks
- ⚡ **Real-time Updates** - Changes sync instantly across all tabs
- 🔒 **Row Level Security** - Complete data isolation at database level
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🚀 **Production Ready** - Optimized for Vercel deployment

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend**: Supabase (Auth, Postgres, Realtime)
- **Deployment**: Vercel

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account ([sign up here](https://supabase.com))
- A Google Cloud Console project with OAuth credentials

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Supabase

#### A. Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Wait for the project to be ready

#### B. Get Supabase Credentials
1. In your Supabase project, go to **Settings** → **API**
2. Copy the **Project URL** and **anon/public key**
3. Update your `.env.local` file (already configured with your credentials)

#### C. Enable Google OAuth
1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Configure Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable **Google+ API**
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add authorized redirect URIs:
     - Development: `https://dzyvudhqaubmfgkkdlqm.supabase.co/auth/v1/callback`
     - Production: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client Secret**
4. In Supabase, paste the Google Client ID and Client Secret
5. Save the configuration

#### D. Create Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Open the `supabase-migration.sql` file from this project
3. Copy and paste the entire SQL script
4. Click **Run** to execute the migration

This will:
- Create the `bookmarks` table
- Enable Row Level Security (RLS)
- Set up RLS policies for data isolation
- Enable Realtime subscriptions

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Authentication Flow
1. User visits the app → redirected to `/login`
2. Clicks "Continue with Google" → Google OAuth flow
3. After authentication → redirected to `/dashboard`
4. Session persists in cookies via middleware

### Data Security
- **Row Level Security (RLS)** enforces data isolation at the database level
- Users can only access their own bookmarks
- RLS policies prevent unauthorized access even if frontend is compromised

### Real-time Updates
- Supabase Realtime WebSocket subscription
- Changes sync instantly across all browser tabs
- No polling required

## Project Structure

```
smart-bookmark/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.js          # OAuth callback handler
│   │   ├── dashboard/
│   │   │   └── page.js               # Dashboard (Server Component)
│   │   ├── login/
│   │   │   └── page.js               # Login page (Client Component)
│   │   ├── layout.js                 # Root layout
│   │   └── page.js                   # Homepage (redirects)
│   ├── components/
│   │   ├── BookmarkList.js           # Bookmark list with realtime (Client)
│   │   └── Header.js                 # Header with logout (Client)
│   ├── lib/
│   │   ├── supabaseClient.js         # Client-side Supabase
│   │   └── supabaseServer.js         # Server-side Supabase
│   └── middleware.js                 # Auth middleware
├── supabase-migration.sql            # Database schema
└── .env.local                        # Environment variables
```

## Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
5. Click **Deploy**

### 3. Update Google OAuth Redirect URIs
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to your OAuth 2.0 Client ID
3. Add your Vercel production URL to authorized redirect URIs:
   - `https://YOUR_VERCEL_APP.vercel.app/auth/callback`
4. Save changes

### 4. Update Supabase Redirect URLs
1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Add your Vercel production URL to **Site URL** and **Redirect URLs**

## Testing

### Authentication
- [ ] Login with Google works
- [ ] Session persists after browser restart
- [ ] Logout redirects to login page

### Bookmarks
- [ ] Can add bookmarks
- [ ] Can delete bookmarks
- [ ] Bookmarks display correctly

### Real-time
- [ ] Open two tabs
- [ ] Add bookmark in Tab 1 → appears in Tab 2
- [ ] Delete bookmark in Tab 1 → disappears in Tab 2

### Security (RLS)
- [ ] Login with User A → add bookmarks
- [ ] Logout → login with User B
- [ ] User B cannot see User A's bookmarks

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## Troubleshooting

### "Invalid login credentials" error
- Ensure Google OAuth is properly configured in Supabase
- Check that redirect URIs match exactly in Google Cloud Console

### Bookmarks not appearing
- Verify the database migration ran successfully
- Check browser console for errors
- Ensure RLS policies are enabled

### Real-time not working
- Verify Realtime is enabled on the `bookmarks` table
- Check that the subscription filter matches the user ID

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
