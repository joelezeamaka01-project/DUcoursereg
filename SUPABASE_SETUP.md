# Supabase Integration Setup Guide

This project has been integrated with Supabase for authentication and database management.

## Prerequisites
- Node.js installed
- Supabase account created
- The Supabase project URL and keys from your dashboard

## Environment Variables

The `.env.local` file contains your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://pptyamoqptxdkpbruvek.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_84BqCFfmaxaSAe1V2snJ2A_YHj71kIU
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3000
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=your_email@gmail.com
```

**Important:** Replace the placeholders:
- `SUPABASE_SERVICE_ROLE_KEY`: Get this from Supabase Dashboard → Settings → API Keys → Service Role Secret
- `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`: Your Gmail or SMTP credentials for password reset emails

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Supabase Tables
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `supabase-schema.sql`
4. Paste it into the SQL Editor and run it

This creates:
- `students` table (main user data)
- `courses` table (optional, for course management)
- `enrollments` table (optional, for course enrollments)

### 3. Update Environment Variables
1. Open `.env.local`
2. Replace `your_service_role_key_here` with your actual Service Role Key
3. Update email credentials for password reset functionality

### 4. Configure Email Sending (Optional)
For password reset emails to work:
- Enable Gmail App Passwords (if using Gmail)
- Or configure your own SMTP server
- Update EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASS in `.env.local`

### 5. Start the Server
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/login` - Login with matric number and password
- `POST /api/register` - Register new student
- `POST /api/request-reset` - Request password reset code
- `POST /api/reset-password` - Reset password with reset code

### Database
All database operations use Supabase from both frontend and backend.

## Frontend Integration

The frontend uses `supabase-client-frontend.js` for:
- User authentication
- Database queries
- Real-time data syncing

### Available Functions
- `signUpUser(email, password, userData)` - Sign up new user
- `loginUser(email, password)` - Log in user
- `logoutUser()` - Log out current user
- `getCurrentUser()` - Get authenticated user
- `resetPassword(email)` - Send password reset email
- `getStudentData(userId)` - Fetch student profile
- `updateStudentData(userId, updates)` - Update student profile

## Security Features

1. **Row Level Security (RLS)** - Enabled on all tables
2. **Password Hashing** - Managed by Supabase Auth
3. **Service Role Key** - Used only on backend for admin operations
4. **Publishable Key** - Safe to expose in frontend (read-only access)

## Troubleshooting

### Database Connection Error
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- Ensure tables are created using `supabase-schema.sql`

### Email Not Sending
- Check EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS in `.env.local`
- Verify Gmail App Password if using Gmail
- Check Email Logs in terminal

### Authentication Issues
- Clear browser cache and localStorage
- Verify user exists in Supabase dashboard
- Check that matric_number and email are unique

## Project Files

- `server.js` - Express backend with API endpoints using Supabase
- `app.js` - Frontend JavaScript for form handling
- `supabase-client.js` - Backend Supabase client
- `supabase-client-frontend.js` - Frontend Supabase client
- `supabase-schema.sql` - Database schema setup
- `.env.local` - Environment variables

## Next Steps

1. Migrate existing Neon data to Supabase (if applicable)
2. Test all authentication flows
3. Set up custom email templates in Supabase
4. Enable additional security features (2FA, email verification)
5. Deploy to production

## Support

For more information:
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [Dominion University Portal](/)
