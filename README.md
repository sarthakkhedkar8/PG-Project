# Dabhade PG

Responsive PG management web app for Dabhade PG.

## Features
- Welcome screen branded **Dabhade PG**
- Admin authentication using Supabase Auth
- Tenant add/search/delete
- Room management
- Rent tracking: Paid/Pending + Cash/UPI/Bank
- Dashboard statistics
- Aadhaar/document upload field
- Responsive mobile + laptop layout
- Online PostgreSQL database through Supabase

## Run locally
1. Copy `.env.example` to `.env`
2. Add your Supabase URL and anon key.
3. Run the SQL in `supabase/schema.sql`.
4. In Supabase Authentication, enable Email provider and create the admin user.
5. `npm install`
6. `npm run dev`

## Deploy to Vercel
Import this folder into Vercel, add the two VITE_* environment variables, then deploy.

The app does not require your Mac or Ubuntu VM to stay on after Vercel deployment.
