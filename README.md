# Smart Bookmark App

A premium, production-ready fullstack bookmark manager built with **Next.js 16**, **Supabase**, and **Tailwind CSS 4**.

Now featuring a stunning **Glassmorphism UI**, smooth **Framer Motion** animations, and a completely modernized user experience.

## Features

- ✨ **Premium UI** - Deep dark theme with rich gradients and glassmorphism effects
- 💎 **Smooth Animations** - Powered by Framer Motion for a fluid feel
- 🔐 **Google OAuth Authentication** - Secure login with Supabase Auth
- 📚 **Bookmark Management** - Add, view, copy, and delete bookmarks instantly
- ⚡ **Real-time Updates** - Changes sync instantly across all devices/tabs
- 🔒 **Row Level Security** - Complete data isolation at database level
- 🎨 **Modern Design System** - Custom scrollbars, glowing effects, and Lucide icons

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **UI Library**: Framer Motion, Lucide React, CLSX
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
     - Development: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
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

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```