# Task Management App with Supabase Authentication

A task management application built with React and Vite, featuring authentication powered by Supabase.

## Setup Instructions

### 1. Supabase Setup

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project
3. From your project dashboard, get your Supabase URL and anon key from the API section
4. Copy these values to your `.env` file:

```
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 2. Email Authentication Setup

1. Go to Authentication → Providers in your Supabase dashboard
2. Ensure Email provider is enabled
3. Configure any additional settings like:
   - Site URL (must match your app URL)
   - Custom email templates (optional)
   - Email confirmation requirements (optional)

### 3. Install Dependencies and Run

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Authentication Features

The app includes a complete authentication system with:

- Email/password login
- New user registration
- Magic link authentication (passwordless)
- Session persistence
- Secure logout functionality

## Project Structure

- `src/lib/supabase.js` - Supabase client setup
- `src/context/AuthContext.jsx` - Authentication context provider
- `src/components/Auth/Login.jsx` - Login component with multiple auth options
- `src/App.jsx` - Main app with authentication flow

## Additional Customization

You can extend the authentication system by:

1. Adding social auth providers (GitHub, Google, etc.)
2. Implementing user profiles
3. Adding role-based access control

## Learn More

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Context API](https://reactjs.org/docs/context.html)
- [Vite Documentation](https://vitejs.dev/guide/)
