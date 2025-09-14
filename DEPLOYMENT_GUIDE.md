# College Event Management System - Deployment Guide

## 🚀 Vercel + Supabase Deployment

This guide will help you deploy your College Event Management System to Vercel with Supabase as the backend.

### Prerequisites
- Vercel account
- Supabase account
- GitHub account (for Vercel deployment)

## 📋 Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project with your organization
4. Choose a region close to your users
5. Set a strong database password

### 1.2 Configure Database
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-setup.sql` into the SQL editor
4. Click **Run** to execute the setup script

### 1.3 Get API Keys
1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.4 Configure Storage Buckets
The setup script automatically creates these storage buckets:
- `avatars` - For user profile pictures
- `event-images` - For event images
- `food-images` - For food stall images

## 📋 Step 2: Vercel Deployment

### 2.1 Prepare Your Code
1. Make sure all changes are committed to your Git repository
2. Ensure your `package.json` includes all necessary dependencies

### 2.2 Deploy to Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the following settings:

#### Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Environment Variables
Add these environment variables in Vercel:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2.3 Configure Vercel Settings
Create a `vercel.json` file in your project root (already included):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 📋 Step 3: Post-Deployment Configuration

### 3.1 Update Supabase URL
The application is configured to use your Supabase URL: `https://oweibvmxwjfajhpszdni.supabase.co`

### 3.2 Test Registration and Login
1. Visit your Vercel deployment URL
2. Try registering a new student account
3. Try registering a new admin account
4. Test login functionality

### 3.3 Configure CORS (if needed)
If you encounter CORS issues:
1. Go to Supabase Dashboard → **Settings** → **API**
2. Add your Vercel domain to **Additional URLs**
3. Add `https://your-vercel-app.vercel.app` to the list

## 🔧 Features Included

### ✅ Fixed Issues
- **Registration & Login**: Now works with real Supabase backend
- **Continuous Reloading**: Fixed authentication state management
- **Profile Management**: Full profile update functionality
- **QR Code Scanner**: Complete attendance scanning system
- **Storage Buckets**: Configured for images and files
- **Real-time Data**: Supabase real-time subscriptions

### 🆕 New Features
- **QR Code Scanner**: Scan student QR codes for attendance
- **Storage Integration**: Upload and manage images
- **Real-time Updates**: Live data synchronization
- **Admin Dashboard**: Complete admin management interface
- **Student Dashboard**: Student event management

## 🎯 QR Code Scanner Usage

### For Students
1. Students can generate QR codes from their profile
2. QR codes contain their user ID and roll number
3. QR codes are used for event attendance

### For Admins
1. Go to **Attendance** tab in admin dashboard
2. Click **"Scan QR Code"** button
3. Allow camera permissions
4. Scan student QR codes
5. Verify student details
6. Mark attendance for events

## 🗄️ Database Schema

The system includes these main tables:
- `profiles` - User profiles and authentication
- `events` - Event management
- `event_registrations` - Student event registrations
- `attendance` - Event attendance tracking
- `food_stalls` - Food stall management
- `stall_reviews` - Food stall reviews
- `payments` - Payment processing
- `feedback` - User feedback system
- `otp_codes` - OTP verification system

## 🔐 Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **Authentication**: Supabase Auth integration
- **Authorization**: Role-based access control
- **Data Validation**: Client and server-side validation
- **Secure Storage**: Protected file uploads

## 🚨 Troubleshooting

### Common Issues

#### 1. Registration Not Working
- Check if Supabase URL and API key are correct
- Verify database tables are created
- Check browser console for errors

#### 2. Continuous Reloading
- This should be fixed with the updated authentication logic
- Clear browser cache and cookies
- Check if environment variables are set correctly

#### 3. QR Scanner Not Working
- Ensure camera permissions are granted
- Check if the device supports camera access
- Verify QR code format is correct

#### 4. Images Not Loading
- Check storage bucket permissions
- Verify file upload policies
- Check if images are properly uploaded

### Debug Steps
1. Check browser console for errors
2. Verify Supabase connection in Network tab
3. Check Vercel function logs
4. Verify environment variables in Vercel dashboard

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Supabase database is properly configured
4. Check Vercel deployment logs

## 🎉 Success!

Once deployed, your College Event Management System will be fully functional with:
- Student and admin registration/login
- Event management
- QR code attendance tracking
- Real-time data synchronization
- Image storage and management
- Complete admin dashboard

Your application is now live at: `https://event-qhyk05tlj-venkatesh-s-projects-4518d258.vercel.app/`
