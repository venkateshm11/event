import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isOfflineModeEnabled } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  department: string;
  maxSeats: number;
  registeredCount: number;
  price: number;
  image: string;
  createdBy?: string;
}

interface FoodStall {
  id: string;
  name: string;
  description: string;
  image: string;
  menu: Array<{ item: string; price: number }>;
  rating: number;
  reviewCount: number;
  reviews: Array<{ id: string; userId: string; userName: string; rating: number; comment: string; date: string }>;
  location?: string;
  contactInfo?: any;
  isActive: boolean;
}

interface DataContextType {
  events: Event[];
  foodStalls: FoodStall[];
  isLoading: boolean;
  registerForEvent: (eventId: string, userId: string) => Promise<boolean>;
  unregisterFromEvent: (eventId: string, userId: string) => Promise<boolean>;
  markAttendance: (eventId: string, userId: string, qrData?: any) => Promise<boolean>;
  addEvent: (event: Omit<Event, 'id' | 'registeredCount'>) => Promise<boolean>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  addFoodStallReview: (stallId: string, review: any) => Promise<boolean>;
  getUserRegisteredEvents: (userId: string) => Event[];
  getUserAttendance: (userId: string) => string[];
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [foodStalls, setFoodStalls] = useState<FoodStall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRegistrations, setUserRegistrations] = useState<Event[]>([]);
  const [userAttendance, setUserAttendance] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated || isOfflineModeEnabled) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      if (isOfflineModeEnabled) {
        // Load mock data for offline mode
        loadMockData();
      } else {
        await Promise.all([
          loadEvents(),
          loadFoodStalls(),
          loadUserData()
        ]);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    // Mock events data
    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Tech Symposium 2024',
        description: 'Annual technology symposium featuring latest innovations',
        date: '2024-12-15',
        time: '09:00',
        location: 'Main Auditorium',
        department: 'Computer Science',
        maxSeats: 200,
        registeredCount: 45,
        price: 100,
        image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
        createdBy: 'admin-1'
      },
      {
        id: '2',
        title: 'Cultural Fest',
        description: 'Annual cultural festival with performances and competitions',
        date: '2024-12-20',
        time: '18:00',
        location: 'Cultural Center',
        department: 'Cultural Committee',
        maxSeats: 500,
        registeredCount: 120,
        price: 50,
        image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
        createdBy: 'admin-1'
      }
    ];

    // Mock food stalls data
    const mockFoodStalls: FoodStall[] = [
      {
        id: '1',
        name: 'Campus Cafe',
        description: 'Fresh coffee and light snacks',
        image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
        menu: [
          { item: 'Coffee', price: 25 },
          { item: 'Sandwich', price: 80 },
          { item: 'Pastry', price: 45 }
        ],
        rating: 4.2,
        reviewCount: 15,
        reviews: [],
        location: 'Main Campus',
        isActive: true
      },
      {
        id: '2',
        name: 'Pizza Corner',
        description: 'Freshly made pizzas and Italian dishes',
        image: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg',
        menu: [
          { item: 'Margherita Pizza', price: 120 },
          { item: 'Pepperoni Pizza', price: 150 },
          { item: 'Garlic Bread', price: 60 }
        ],
        rating: 4.5,
        reviewCount: 23,
        reviews: [],
        location: 'Food Court',
        isActive: true
      }
    ];

    setEvents(mockEvents);
    setFoodStalls(mockFoodStalls);
  };

  const loadEvents = async () => {
    try {
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
          *,
          event_registrations(count)
        `)
        .order('date', { ascending: true });

      if (error) throw error;

      const formattedEvents = eventsData?.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        department: event.department,
        maxSeats: event.max_seats,
        registeredCount: event.event_registrations?.[0]?.count || 0,
        price: event.price,
        image: event.image_url || `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg`,
        createdBy: event.created_by
      })) || [];

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadFoodStalls = async () => {
    try {
      const { data: stallsData, error } = await supabase
        .from('food_stalls')
        .select(`
          *,
          stall_reviews(
            id,
            rating,
            comment,
            created_at,
            profiles(name)
          )
        `)
        .eq('is_active', true);

      if (error) throw error;

      const formattedStalls = stallsData?.map(stall => {
        const reviews = stall.stall_reviews?.map(review => ({
          id: review.id,
          userId: review.profiles?.id || '',
          userName: review.profiles?.name || 'Anonymous',
          rating: review.rating,
          comment: review.comment || '',
          date: review.created_at
        })) || [];

        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;

        return {
          id: stall.id,
          name: stall.name,
          description: stall.description,
          image: stall.image_url || `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg`,
          menu: stall.menu || [],
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
          reviews,
          location: stall.location,
          contactInfo: stall.contact_info,
          isActive: stall.is_active
        };
      }) || [];

      setFoodStalls(formattedStalls);
    } catch (error) {
      console.error('Error loading food stalls:', error);
    }
  };

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load user registrations
      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select(`
          event_id,
          events(*)
        `)
        .eq('user_id', user.id)
        .eq('payment_status', 'completed');

      if (regError) throw regError;

      const userEvents = registrations?.map(reg => ({
        id: reg.events.id,
        title: reg.events.title,
        description: reg.events.description,
        date: reg.events.date,
        time: reg.events.time,
        location: reg.events.location,
        department: reg.events.department,
        maxSeats: reg.events.max_seats,
        registeredCount: 0, // Will be updated when events load
        price: reg.events.price,
        image: reg.events.image_url || `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg`
      })) || [];

      setUserRegistrations(userEvents);

      // Load user attendance
      const { data: attendance, error: attError } = await supabase
        .from('attendance')
        .select('event_id')
        .eq('user_id', user.id);

      if (attError) throw attError;

      const attendedEventIds = attendance?.map(att => att.event_id) || [];
      setUserAttendance(attendedEventIds);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const registerForEvent = async (eventId: string, userId: string): Promise<boolean> => {
    try {
      // Check if already registered
      const { data: existing } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (existing) return false;

      // Check event capacity
      const event = events.find(e => e.id === eventId);
      if (!event || event.registeredCount >= event.maxSeats) return false;

      // Create registration
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: userId,
          payment_status: 'completed' // Assuming payment is handled separately
        });

      if (error) throw error;

      // Refresh data
      await loadEvents();
      await loadUserData();
      return true;
    } catch (error) {
      console.error('Error registering for event:', error);
      return false;
    }
  };

  const unregisterFromEvent = async (eventId: string, userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;

      // Refresh data
      await loadEvents();
      await loadUserData();
      return true;
    } catch (error) {
      console.error('Error unregistering from event:', error);
      return false;
    }
  };

  const markAttendance = async (eventId: string, userId: string, qrData?: any): Promise<boolean> => {
    try {
      // Check if already marked
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (existing) return false;

      // Mark attendance
      const { error } = await supabase
        .from('attendance')
        .insert({
          event_id: eventId,
          user_id: userId,
          marked_by: user?.id,
          qr_data: qrData
        });

      if (error) throw error;

      // Refresh user data
      await loadUserData();
      return true;
    } catch (error) {
      console.error('Error marking attendance:', error);
      return false;
    }
  };

  const addEvent = async (eventData: Omit<Event, 'id' | 'registeredCount'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          location: eventData.location,
          department: eventData.department,
          max_seats: eventData.maxSeats,
          price: eventData.price,
          image_url: eventData.image,
          created_by: user?.id
        });

      if (error) throw error;

      await loadEvents();
      return true;
    } catch (error) {
      console.error('Error adding event:', error);
      return false;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: updates.title,
          description: updates.description,
          date: updates.date,
          time: updates.time,
          location: updates.location,
          department: updates.department,
          max_seats: updates.maxSeats,
          price: updates.price,
          image_url: updates.image
        })
        .eq('id', eventId);

      if (error) throw error;

      await loadEvents();
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    }
  };

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      await loadEvents();
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  };

  const addFoodStallReview = async (stallId: string, reviewData: any): Promise<boolean> => {
    try {
      // Check if user already reviewed
      const { data: existing } = await supabase
        .from('stall_reviews')
        .select('id')
        .eq('stall_id', stallId)
        .eq('user_id', reviewData.userId)
        .single();

      if (existing) return false;

      const { error } = await supabase
        .from('stall_reviews')
        .insert({
          stall_id: stallId,
          user_id: reviewData.userId,
          rating: reviewData.rating,
          comment: reviewData.comment
        });

      if (error) throw error;

      await loadFoodStalls();
      return true;
    } catch (error) {
      console.error('Error adding review:', error);
      return false;
    }
  };

  const getUserRegisteredEvents = (userId: string): Event[] => {
    return userRegistrations;
  };

  const getUserAttendance = (userId: string): string[] => {
    return userAttendance;
  };

  const refreshData = async () => {
    await loadInitialData();
  };

  return (
    <DataContext.Provider value={{
      events,
      foodStalls,
      isLoading,
      registerForEvent,
      unregisterFromEvent,
      markAttendance,
      addEvent,
      updateEvent,
      deleteEvent,
      addFoodStallReview,
      getUserRegisteredEvents,
      getUserAttendance,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};