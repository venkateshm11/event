import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use mock/offline mode if no valid Supabase credentials are provided
const isOfflineMode = !supabaseUrl || !supabaseAnonKey || 
  supabaseUrl.includes('demo.supabase.co') || 
  supabaseUrl === 'your_supabase_project_url_here';

if (isOfflineMode) {
  console.warn('🚧 Running in OFFLINE/DEMO mode. Supabase features are disabled.');
  console.warn('📝 To enable full functionality, set up real Supabase credentials in .env file');
}

// Create Supabase client with fallback for offline mode
export const supabase = isOfflineMode 
  ? createClient('https://mock.supabase.co', 'mock-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    })
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });

// Export offline mode flag for use in other components
export const isOfflineModeEnabled = isOfflineMode;

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'student' | 'admin';
          roll_number: string | null;
          mobile_number: string | null;
          otp_enabled: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'student' | 'admin';
          roll_number?: string | null;
          mobile_number?: string | null;
          otp_enabled?: boolean;
          avatar_url?: string | null;
        };
        Update: {
          email?: string;
          name?: string;
          roll_number?: string | null;
          mobile_number?: string | null;
          otp_enabled?: boolean;
          avatar_url?: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          date: string;
          time: string;
          location: string;
          department: string;
          max_seats: number;
          price: number;
          image_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          description: string;
          date: string;
          time: string;
          location: string;
          department: string;
          max_seats: number;
          price?: number;
          image_url?: string | null;
          created_by?: string | null;
        };
        Update: {
          title?: string;
          description?: string;
          date?: string;
          time?: string;
          location?: string;
          department?: string;
          max_seats?: number;
          price?: number;
          image_url?: string | null;
        };
      };
      event_registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          registration_date: string;
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_id: string | null;
        };
        Insert: {
          event_id: string;
          user_id: string;
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_id?: string | null;
        };
        Update: {
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_id?: string | null;
        };
      };
      attendance: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          marked_at: string;
          marked_by: string | null;
          qr_data: any | null;
        };
        Insert: {
          event_id: string;
          user_id: string;
          marked_by?: string | null;
          qr_data?: any | null;
        };
        Update: {
          marked_by?: string | null;
          qr_data?: any | null;
        };
      };
      food_stalls: {
        Row: {
          id: string;
          name: string;
          description: string;
          image_url: string | null;
          menu: any[];
          location: string | null;
          contact_info: any | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description: string;
          image_url?: string | null;
          menu?: any[];
          location?: string | null;
          contact_info?: any | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          description?: string;
          image_url?: string | null;
          menu?: any[];
          location?: string | null;
          contact_info?: any | null;
          is_active?: boolean;
        };
      };
      stall_reviews: {
        Row: {
          id: string;
          stall_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          stall_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          event_id: string | null;
          amount: number;
          currency: string;
          payment_method: string;
          transaction_id: string | null;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_data: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          event_id?: string | null;
          amount: number;
          currency?: string;
          payment_method: string;
          transaction_id?: string | null;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_data?: any | null;
        };
        Update: {
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          transaction_id?: string | null;
          payment_data?: any | null;
        };
      };
      feedback: {
        Row: {
          id: string;
          user_id: string | null;
          type: 'general' | 'event' | 'food' | 'facilities';
          subject: string;
          message: string;
          rating: number | null;
          is_anonymous: boolean;
          status: 'pending' | 'reviewed' | 'resolved';
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          type: 'general' | 'event' | 'food' | 'facilities';
          subject: string;
          message: string;
          rating?: number | null;
          is_anonymous?: boolean;
          status?: 'pending' | 'reviewed' | 'resolved';
        };
        Update: {
          status?: 'pending' | 'reviewed' | 'resolved';
        };
      };
      otp_codes: {
        Row: {
          id: string;
          identifier: string;
          otp_code: string;
          type: 'login' | 'password_reset' | 'verification';
          expires_at: string;
          used_at: string | null;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          identifier: string;
          otp_code: string;
          type: 'login' | 'password_reset' | 'verification';
          expires_at: string;
          user_id?: string | null;
        };
        Update: {
          used_at?: string | null;
        };
      };
    };
    Functions: {
      get_event_stats: {
        Args: { event_uuid: string };
        Returns: {
          registered_count: number;
          attended_count: number;
          attendance_rate: number;
        }[];
      };
      get_stall_rating: {
        Args: { stall_uuid: string };
        Returns: {
          average_rating: number;
          review_count: number;
        }[];
      };
    };
  };
}