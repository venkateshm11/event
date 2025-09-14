-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE stall_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for events table
CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create policies for event_registrations table
CREATE POLICY "Users can view their own registrations" ON event_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events" ON event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unregister from events" ON event_registrations
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for attendance table
CREATE POLICY "Users can view their own attendance" ON attendance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can mark attendance" ON attendance
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create policies for food_stalls table
CREATE POLICY "Anyone can view food stalls" ON food_stalls
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage food stalls" ON food_stalls
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create policies for stall_reviews table
CREATE POLICY "Anyone can view reviews" ON stall_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON stall_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for payments table
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for feedback table
CREATE POLICY "Users can create feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_anonymous = true);

CREATE POLICY "Admins can view feedback" ON feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create policies for otp_codes table
CREATE POLICY "Users can manage their own OTP codes" ON otp_codes
  FOR ALL USING (auth.uid() = user_id);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true);

-- Create storage bucket for food stall images
INSERT INTO storage.buckets (id, name, public) VALUES ('food-images', 'food-images', true);

-- Create storage policies for avatars bucket
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policies for event images bucket
CREATE POLICY "Admins can upload event images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-images' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view event images" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-images');

-- Create storage policies for food images bucket
CREATE POLICY "Admins can upload food images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'food-images' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view food images" ON storage.objects
  FOR SELECT USING (bucket_id = 'food-images');

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to get event statistics
CREATE OR REPLACE FUNCTION get_event_stats(event_uuid UUID)
RETURNS TABLE(registered_count BIGINT, attended_count BIGINT, attendance_rate NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(er.registered_count, 0) as registered_count,
    COALESCE(a.attended_count, 0) as attended_count,
    CASE 
      WHEN COALESCE(er.registered_count, 0) > 0 
      THEN ROUND((COALESCE(a.attended_count, 0)::NUMERIC / er.registered_count::NUMERIC) * 100, 2)
      ELSE 0
    END as attendance_rate
  FROM (
    SELECT COUNT(*) as registered_count
    FROM event_registrations 
    WHERE event_id = event_uuid AND payment_status = 'completed'
  ) er
  CROSS JOIN (
    SELECT COUNT(*) as attended_count
    FROM attendance 
    WHERE event_id = event_uuid
  ) a;
END;
$$;

-- Create function to get stall rating
CREATE OR REPLACE FUNCTION get_stall_rating(stall_uuid UUID)
RETURNS TABLE(average_rating NUMERIC, review_count BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(rating), 0) as average_rating,
    COUNT(*) as review_count
  FROM stall_reviews 
  WHERE stall_id = stall_uuid;
END;
$$;
