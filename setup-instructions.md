# Database Setup Instructions

## Quick Setup for Your College Management System

The registration error occurs because the database tables haven't been created yet in your Supabase project. Follow these steps:

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Open your project: `oweibvmxwjfajhpszdni`

### Step 2: Run Database Schema
1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy and paste the entire contents of `database-schema.sql` into the editor
4. Click **"Run"** to execute the schema

### Step 3: Verify Tables Created
After running the schema, you should see these tables in the **"Table Editor"**:
- `profiles` (with roll_number and mobile_number columns)
- `events`
- `event_registrations`
- `attendance`
- `food_stalls`
- `stall_reviews`
- `payments`
- `feedback`
- `otp_codes`

### Step 4: Test Registration
1. Try registering a new student
2. The error should be resolved
3. You can then login with the registered credentials

## What Was Fixed

I've updated the registration code to:
- ✅ Handle missing database tables gracefully
- ✅ Provide clear error messages when database isn't set up
- ✅ Skip roll number checking if table doesn't exist yet
- ✅ Clean up failed registrations properly

## Need Help?

If you encounter any issues:
1. Check the browser console for detailed error messages
2. Verify your Supabase URL and API key in the `.env` file
3. Make sure all tables were created successfully in Supabase

The registration should work perfectly after running the database schema!
