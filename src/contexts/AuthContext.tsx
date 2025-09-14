import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isOfflineModeEnabled } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  name: string;
  email: string;
  rollNumber?: string;
  mobileNumber?: string;
  role: 'student' | 'admin';
  otpEnabled?: boolean;
  avatarUrl?: string;
}

interface AuthContextType {
  user: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any, role: 'student' | 'admin') => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  register: (userData: any, role: 'student' | 'admin') => Promise<{ success: boolean; message: string }>;
  sendOTP: (identifier: string, type: 'email' | 'mobile') => Promise<{ success: boolean; message: string }>;
  verifyOTP: (identifier: string, otp: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (identifier: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
  enableOTPLogin: (mobileNumber: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOfflineModeEnabled) {
      // In offline mode, skip Supabase auth and set loading to false
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const initAuth = async () => {
      try {
        // Add timeout for initial session check
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session fetch timeout')), 8000); // 8 second timeout
        });

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (!mounted) return;
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Add timeout to prevent infinite loading
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000); // 10 second timeout
      });

      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching profile:', error.message || error);
        // If table doesn't exist or timeout, stop loading and don't set user
        if (error.message?.includes('relation "public.profiles" does not exist') || 
            error.message?.includes('Profile fetch timeout')) {
          console.warn('Profiles table does not exist or fetch timed out. User will need to complete setup.');
          setIsLoading(false);
          return;
        }
        throw error;
      }

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          rollNumber: profile.roll_number,
          mobileNumber: profile.mobile_number,
          role: profile.role,
          otpEnabled: profile.otp_enabled,
          avatarUrl: profile.avatar_url
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message || error);
      console.error('Profile fetch error details:', error);
      // Don't keep loading indefinitely on error
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: any, role: 'student' | 'admin'): Promise<{ success: boolean; message: string }> => {
    try {
      // Handle offline mode
      if (isOfflineModeEnabled) {
        if (role === 'admin') {
          if (!credentials.email || !credentials.password) {
            return { success: false, message: '⚠️ All fields are required' };
          }
          // Mock admin login for demo
          const mockAdmin: Profile = {
            id: 'admin-1',
            name: 'Demo Admin',
            email: credentials.email,
            role: 'admin',
            otpEnabled: false
          };
          setUser(mockAdmin);
          setSession({ user: { id: 'admin-1' } } as Session);
          return { success: true, message: '✅ Demo Admin login successful! 🛡️ (Offline Mode)' };
        } else {
          if (!credentials.rollNumber || !credentials.password) {
            return { success: false, message: '⚠️ Roll number and password are required' };
          }
          // Mock student login for demo
          const mockStudent: Profile = {
            id: 'student-1',
            name: 'Demo Student',
            email: `${credentials.rollNumber}@demo.com`,
            rollNumber: credentials.rollNumber,
            role: 'student',
            otpEnabled: false
          };
          setUser(mockStudent);
          setSession({ user: { id: 'student-1' } } as Session);
          return { success: true, message: '✅ Demo Student login successful! 🎓 (Offline Mode)' };
        }
      }

      if (role === 'admin') {
        if (!credentials.email || !credentials.password) {
          return { success: false, message: '⚠️ All fields are required' };
        }

        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl || supabaseUrl.includes('demo.supabase.co')) {
          return { success: false, message: '⚠️ Supabase not configured. Please check your environment variables.' };
        }

        // TEMPORARY: Quick admin bypass for testing (remove after fixing Supabase)
        if (credentials.email === 'admin@test.com' && credentials.password === 'admin123') {
          const mockAdmin: Profile = {
            id: 'temp-admin',
            name: 'Test Admin',
            email: credentials.email,
            role: 'admin',
            otpEnabled: false
          };
          setUser(mockAdmin);
          setSession({ user: { id: 'temp-admin' } } as Session);
          return { success: true, message: '✅ Temporary Admin Access (Bypass Mode)' };
        }
        
        // Try to authenticate first, then check profile
        // Add timeout to prevent infinite loading
        const authPromise = supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Authentication timeout - please try logging in again')), 60000);
        });

        const { error } = await Promise.race([authPromise, timeoutPromise]) as any;

        if (error) {
          console.error('Supabase auth error:', error);
          throw new Error(error.message || 'Authentication failed');
        }

        // After successful auth, try to check if admin profile exists
        try {
          const { data: adminProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', credentials.email)
            .eq('role', 'admin')
            .single();

          if (profileError && !profileError.message?.includes('relation "public.profiles" does not exist')) {
            console.warn('Profile check failed:', profileError);
          }

          if (!adminProfile && !profileError?.message?.includes('relation "public.profiles" does not exist')) {
            console.warn('Admin profile not found in database, but authentication succeeded');
          }
        } catch (profileCheckError) {
          console.warn('Profile check error (non-blocking):', profileCheckError);
        }

        return { success: true, message: '✅ Admin login successful! 🛡️' };
      } else {
        if (credentials.useOTP) {
          if (!credentials.rollNumber || !credentials.mobileNumber) {
            return { success: false, message: '⚠️ Roll number and mobile number are required for OTP login' };
          }

          // Validate mobile number format
          const mobileRegex = /^[0-9]{10}$/;
          if (!mobileRegex.test(credentials.mobileNumber.replace(/\D/g, ''))) {
            return { success: false, message: '⚠️ Please enter a valid 10-digit mobile number' };
          }

          // Check if student exists
          const { data: studentProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('roll_number', credentials.rollNumber)
            .eq('mobile_number', credentials.mobileNumber)
            .eq('role', 'student')
            .single();

          if (!studentProfile) {
            return { success: false, message: '⚠️ Invalid roll number or mobile number not registered' };
          }

          return { success: true, message: '📩 OTP will be sent to your mobile number' };
        } else {
          if (!credentials.rollNumber || !credentials.password) {
            return { success: false, message: '⚠️ Roll number and password are required' };
          }

          // Check if Supabase is properly configured
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (!supabaseUrl || supabaseUrl === 'your-supabase-url' || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            // Offline mode - simulate login
            const mockStudent = {
              id: 'student-1',
              name: 'Demo Student',
              email: `${credentials.rollNumber}@demo.com`,
              rollNumber: credentials.rollNumber,
              role: 'student' as const,
              otpEnabled: false
            };
            setUser(mockStudent);
            setSession({ user: { id: 'student-1' } } as Session);
            return { success: true, message: '✅ Demo login successful! (Offline Mode)' };
          }

          try {
            // Get student profile by roll number
            const { data: studentProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('roll_number', credentials.rollNumber)
              .eq('role', 'student')
              .single();

            if (profileError) {
              // If table doesn't exist, use offline mode
              if (profileError.message?.includes('relation "public.profiles" does not exist')) {
                const mockStudent = {
                  id: 'student-1',
                  name: 'Demo Student',
                  email: `${credentials.rollNumber}@demo.com`,
                  rollNumber: credentials.rollNumber,
                  role: 'student' as const,
                  otpEnabled: false
                };
                setUser(mockStudent);
                setSession({ user: { id: 'student-1' } } as Session);
                return { success: true, message: '✅ Demo login successful! (Offline Mode)' };
              }
              console.error('Profile lookup error:', profileError);
              return { success: false, message: '⚠️ Invalid roll number or user not found' };
            }

            if (!studentProfile) {
              return { success: false, message: '⚠️ Invalid roll number or user not found' };
            }

            const { error } = await supabase.auth.signInWithPassword({
              email: studentProfile.email,
              password: credentials.password,
            });

            if (error) {
              console.error('Supabase auth error:', error);
              throw new Error(error.message || 'Authentication failed');
            }
            return { success: true, message: '✅ Login successful! Welcome back! 🎓' };
          } catch (authError: any) {
            console.error('Authentication error:', authError);
            return { success: false, message: '❌ Invalid credentials or authentication failed' };
          }
        }
      }
    } catch (error: any) {
      console.error('Login error:', error.message || error);
      console.error('Login error details:', error);
      return { success: false, message: `❌ Login failed: ${error.message || 'Please check your credentials.'}` };
    }
  };

  const register = async (userData: any, role: 'student' | 'admin'): Promise<{ success: boolean; message: string }> => {
    try {
      // Handle offline mode
      if (isOfflineModeEnabled) {
        if (role === 'student') {
          if (!userData.name || !userData.rollNumber || !userData.email || !userData.password) {
            return { success: false, message: '⚠️ All required fields must be filled' };
          }
          return { success: true, message: '✅ Demo registration successful! Please log in to continue. (Offline Mode)' };
        } else {
          if (!userData.name || !userData.email || !userData.password) {
            return { success: false, message: '⚠️ All fields are required' };
          }
          return { success: true, message: '✅ Demo admin registered successfully. (Offline Mode)' };
        }
      }

      if (role === 'student') {
        if (!userData.name || !userData.rollNumber || !userData.email || !userData.password) {
          return { success: false, message: '⚠️ All required fields must be filled' };
        }

        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl || supabaseUrl.includes('demo.supabase.co')) {
          return { success: false, message: '⚠️ Supabase not configured. Please check your environment variables.' };
        }

        // Check if roll number already exists (skip if table doesn't exist yet)
        try {
          const { data: existingStudent, error: checkError } = await supabase
            .from('profiles')
            .select('roll_number')
            .eq('roll_number', userData.rollNumber)
            .single();

          // If there's an error other than "not found" or "table doesn't exist"
          if (checkError && checkError.code !== 'PGRST116' && !checkError.message?.includes('relation "public.profiles" does not exist')) {
            console.error('Error checking existing student:', checkError);
            throw new Error('Database error while checking roll number');
          }

          if (existingStudent) {
            return { success: false, message: '⚠️ Roll Number already registered.' };
          }
        } catch (error: any) {
          // If table doesn't exist, that's okay - we'll create the profile anyway
          if (!error.message?.includes('relation "public.profiles" does not exist')) {
            console.error('Unexpected error checking roll number:', error);
            throw error;
          }
          console.log('Profiles table does not exist yet, will create profile after user registration');
        }

        if (userData.enableOTP && !userData.mobileNumber) {
          return { success: false, message: '⚠️ Mobile number required for OTP login.' };
        }

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              role: 'student'
            }
          }
        });

        if (authError) {
          console.error('Supabase registration error:', authError);
          throw new Error(authError.message || 'Registration failed');
        }

        if (authData.user) {
          // Create profile (with error handling for missing table)
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                email: userData.email,
                name: userData.name,
                role: 'student',
                roll_number: userData.rollNumber,
                mobile_number: userData.mobileNumber || null,
                otp_enabled: userData.enableOTP || false
              });

            if (profileError) {
              console.error('Profile creation error:', profileError);
              // If table doesn't exist, provide helpful message
              if (profileError.message?.includes('relation "public.profiles" does not exist')) {
                return { success: false, message: '⚠️ Database not set up. Please run the database schema first.' };
              }
              throw profileError;
            }
          } catch (error: any) {
            console.error('Profile creation failed:', error);
            // Clean up the auth user if profile creation fails
            await supabase.auth.admin.deleteUser(authData.user.id);
            throw error;
          }
        }

        return { success: true, message: '✅ Registration successful! Please log in to continue.' };
      } else {
        // Admin registration
        if (!userData.name || !userData.email || !userData.password) {
          return { success: false, message: '⚠️ All fields are required' };
        }

        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl || supabaseUrl.includes('demo.supabase.co')) {
          return { success: false, message: '⚠️ Supabase not configured. Please check your environment variables.' };
        }

        // Check if admin already exists
        const { data: existingAdmin } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', userData.email)
          .eq('role', 'admin')
          .single();

        if (existingAdmin) {
          return { success: false, message: '⚠️ Admin already exists.' };
        }

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              role: 'admin'
            }
          }
        });

        if (authError) {
          console.error('Supabase registration error:', authError);
          throw new Error(authError.message || 'Registration failed');
        }

        if (authData.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: userData.email,
              name: userData.name,
              role: 'admin',
              mobile_number: userData.mobileNumber || null,
              otp_enabled: userData.enableOTP || false
            });

          if (profileError) throw profileError;
        }

        return { success: true, message: '✅ Admin registered successfully.' };
      }
    } catch (error: any) {
      console.error('Registration error:', error.message || error);
      console.error('Registration error details:', error);
      return { success: false, message: `❌ Registration failed: ${error.message || 'Please try again.'}` };
    }
  };

  const sendOTP = async (identifier: string, type: 'email' | 'mobile'): Promise<{ success: boolean; message: string }> => {
    try {
      if (!identifier) {
        return { success: false, message: '⚠️ Identifier is required' };
      }

      // Validate email format
      if (type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(identifier)) {
          return { success: false, message: '⚠️ Invalid email format' };
        }
      }

      // Validate mobile format (10 digits)
      if (type === 'mobile') {
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(identifier.replace(/\D/g, ''))) {
          return { success: false, message: '⚠️ Invalid mobile number format' };
        }
      }

      // Check if user exists
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.eq.${identifier},mobile_number.eq.${identifier},roll_number.eq.${identifier}`)
        .single();

      if (!userProfile) {
        return { success: false, message: '⚠️ No account found with this email/mobile number' };
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      // Store OTP in database
      const { error } = await supabase
        .from('otp_codes')
        .insert({
          identifier,
          otp_code: otp,
          type: 'login',
          expires_at: expiresAt,
          user_id: userProfile.id
        });

      if (error) throw error;

      // Simulate sending OTP (in real app, would send via SMS/Email service)
      console.log(`OTP for ${identifier} (${type}): ${otp}`);
      
      return { success: true, message: `📩 OTP sent to your ${type === 'email' ? 'email address' : 'mobile number'}. Valid for 5 minutes.` };
    } catch (error: any) {
      console.error('Send OTP error:', error.message || error);
      console.error('Send OTP error details:', error);
      return { success: false, message: `❌ Failed to send OTP: ${error.message || 'Please try again.'}` };
    }
  };

  const verifyOTP = async (identifier: string, otp: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!identifier || !otp) {
        return { success: false, message: '⚠️ OTP is required' };
      }

      if (otp.length !== 6) {
        return { success: false, message: '⚠️ OTP must be 6 digits' };
      }

      // Get OTP record
      const { data: otpRecord, error: otpError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('identifier', identifier)
        .eq('otp_code', otp)
        .is('used_at', null)
        .single();

      if (otpError || !otpRecord) {
        return { success: false, message: '⚠️ Invalid or Expired OTP. Please request a new one.' };
      }

      // Check if OTP is expired
      if (new Date() > new Date(otpRecord.expires_at)) {
        return { success: false, message: '⚠️ Invalid or Expired OTP. Please request a new one.' };
      }

      // Mark OTP as used
      const { error: updateError } = await supabase
        .from('otp_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('id', otpRecord.id);

      if (updateError) throw updateError;

      // For login flow, sign in the user
      if (otpRecord.user_id) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otpRecord.user_id)
          .single();

        if (userProfile && userProfile.role === 'student') {
          // Create a session for the user (in real app, you'd use proper auth flow)
          // For now, we'll simulate successful login
          await fetchUserProfile(userProfile.id);
        }
      }

      return { success: true, message: '✅ OTP verified successfully!' };
    } catch (error: any) {
      console.error('Verify OTP error:', error.message || error);
      console.error('Verify OTP error details:', error);
      return { success: false, message: `❌ OTP verification failed: ${error.message || 'Invalid or Expired OTP. Please try again.'}` };
    }
  };

  const resetPassword = async (identifier: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!identifier || !newPassword) {
        return { success: false, message: '⚠️ All fields are required' };
      }

      if (newPassword.length < 6) {
        return { success: false, message: '⚠️ Password must be at least 6 characters' };
      }

      // Get user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.eq.${identifier},roll_number.eq.${identifier},mobile_number.eq.${identifier}`)
        .single();

      if (!userProfile) {
        return { success: false, message: '⚠️ User not found' };
      }

      // Update password using Supabase auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { success: true, message: '🔑 Password reset successful!' };
    } catch (error: any) {
      console.error('Reset password error:', error.message || error);
      console.error('Reset password error details:', error);
      return { success: false, message: `❌ Password reset failed: ${error.message || 'Please try again.'}` };
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    try {
      if (!user) return false;

      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          mobile_number: updates.mobileNumber,
          otp_enabled: updates.otpEnabled,
          avatar_url: updates.avatarUrl
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Update profile error:', errorMessage);
      console.error('Update profile error details:', error);
      return false;
    }
  };

  const enableOTPLogin = async (mobileNumber: string): Promise<boolean> => {
    return updateProfile({ mobileNumber, otpEnabled: true });
  };

  const logout = async () => {
    try {
      // Clear local state first
      setUser(null);
      setSession(null);
      setIsLoading(false);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Supabase logout warning:', error.message);
        // Don't throw error as local state is already cleared
      }
      
      // Force redirect to login page
      window.location.href = '/';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Logout error:', errorMessage);
      // Even if logout fails, clear local state and redirect
      setUser(null);
      setSession(null);
      setIsLoading(false);
      window.location.href = '/';
    }
  };

  const isAuthenticated = !!session && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated,
      isLoading,
      login,
      logout,
      register,
      sendOTP,
      verifyOTP,
      resetPassword,
      updateProfile,
      enableOTPLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};