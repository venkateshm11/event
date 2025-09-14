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

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

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
    } catch (error) {
      console.error('Error fetching profile:', error);
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
        
        // Check if admin exists
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', credentials.email)
          .eq('role', 'admin')
          .single();

        if (!adminProfile) {
          return { success: false, message: '⚠️ Admin account not found' };
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) throw error;
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

          // Get student profile by roll number
          const { data: studentProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('roll_number', credentials.rollNumber)
            .eq('role', 'student')
            .single();

          if (!studentProfile) {
            return { success: false, message: '⚠️ Invalid roll number' };
          }

          const { error } = await supabase.auth.signInWithPassword({
            email: studentProfile.email,
            password: credentials.password,
          });

          if (error) throw error;
          return { success: true, message: '✅ Login successful! Welcome back! 🎓' };
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: '❌ Login failed. Please check your credentials.' };
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

        // Check if roll number already exists
        const { data: existingStudent } = await supabase
          .from('profiles')
          .select('roll_number')
          .eq('roll_number', userData.rollNumber)
          .single();

        if (existingStudent) {
          return { success: false, message: '⚠️ Roll Number already registered.' };
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

        if (authError) throw authError;

        if (authData.user) {
          // Create profile
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

          if (profileError) throw profileError;
        }

        return { success: true, message: '✅ Registration successful! Please log in to continue.' };
      } else {
        // Admin registration
        if (!userData.name || !userData.email || !userData.password) {
          return { success: false, message: '⚠️ All fields are required' };
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

        if (authError) throw authError;

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
      console.error('Registration error:', error);
      return { success: false, message: '❌ Registration failed. Please try again.' };
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
      console.error('Send OTP error:', error);
      return { success: false, message: '❌ Failed to send OTP. Please try again.' };
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
      console.error('Verify OTP error:', error);
      return { success: false, message: '⚠️ Invalid or Expired OTP. Please try again.' };
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
      console.error('Reset password error:', error);
      return { success: false, message: '⚠️ Password reset failed. Please try again.' };
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
      console.error('Update profile error:', error);
      return false;
    }
  };

  const enableOTPLogin = async (mobileNumber: string): Promise<boolean> => {
    return updateProfile({ mobileNumber, otpEnabled: true });
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
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