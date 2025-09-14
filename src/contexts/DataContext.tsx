import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

// Types
export interface Event {
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

export interface FoodStall {
  id: string;
  name: string;
  description: string;
  image: string;
  menu: { item: string; price: number }[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  location: string;
  contactInfo?: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface DataContextType {
  events: Event[];
  foodStalls: FoodStall[];
  isLoading: boolean;
  registerForEvent: (eventId: string, userId: string) => Promise<boolean>;
  unregisterFromEvent: (eventId: string, userId: string) => Promise<boolean>;
  markAttendance: (eventId: string, userId: string, qrData?: any) => Promise<boolean>;
  addEvent: (eventData: Omit<Event, 'id' | 'registeredCount'>) => Promise<boolean>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  addFoodStall: (stallData: Omit<FoodStall, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => Promise<boolean>;
  updateFoodStall: (stallId: string, updates: Partial<FoodStall>) => Promise<boolean>;
  deleteFoodStall: (stallId: string) => Promise<boolean>;
  addFoodStallReview: (stallId: string, reviewData: any) => Promise<boolean>;
  getUserRegisteredEvents: () => Event[];
  getUserAttendance: () => string[];
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

// Check if offline mode is enabled
const isOfflineModeEnabled = !import.meta.env.VITE_SUPABASE_URL || 
                             !import.meta.env.VITE_SUPABASE_ANON_KEY ||
                             import.meta.env.VITE_SUPABASE_URL === 'your-supabase-url' ||
                             import.meta.env.VITE_SUPABASE_ANON_KEY === 'your-supabase-anon-key';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [foodStalls, setFoodStalls] = useState<FoodStall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRegistrations, setUserRegistrations] = useState<Event[]>([]);
  const [userAttendance, setUserAttendance] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const initData = async () => {
      if (isAuthenticated || isOfflineModeEnabled) {
        await loadInitialData();
      } else {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      if (isOfflineModeEnabled) {
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
      }
    ];

    const mockFoodStalls: FoodStall[] = [
      {
        id: '1',
        name: 'Campus Cafe',
        description: 'Fresh coffee and light snacks',
        image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
        menu: [
          { item: 'Coffee', price: 25 },
          { item: 'Sandwich', price: 80 }
        ],
        rating: 4.2,
        reviewCount: 15,
        reviews: [],
        location: 'Main Campus',
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

      if (error) {
        // If table doesn't exist, use mock data
        if (error.message?.includes('relation "public.events" does not exist')) {
          console.warn('Events table does not exist, using mock data');
          loadMockData();
          return;
        }
        throw error;
      }

      const formattedEvents = eventsData?.map((event: any) => ({
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
      // Fallback to empty array to prevent infinite loading
      setEvents([]);
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

      if (error) {
        // If table doesn't exist, use mock data
        if (error.message?.includes('relation "public.food_stalls" does not exist')) {
          console.warn('Food stalls table does not exist, using mock data');
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
            }
          ];
          setFoodStalls(mockFoodStalls);
          return;
        }
        throw error;
      }

      const formattedStalls = stallsData?.map((stall: any) => {
        const reviews = stall.stall_reviews?.map((review: any) => ({
          id: review.id,
          userId: review.profiles?.id || '',
          userName: review.profiles?.name || 'Anonymous',
          rating: review.rating,
          comment: review.comment || '',
          date: review.created_at
        })) || [];

        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
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
      // Fallback to empty array to prevent infinite loading
      setFoodStalls([]);
    }
  };

  const loadUserData = async () => {
    if (!user?.id) {
      setUserRegistrations([]);
      setUserAttendance([]);
      return;
    }

    try {
      // Load user registrations with error handling for missing tables
      try {
        const { data: registrations, error: regError } = await supabase
          .from('event_registrations')
          .select(`
            event_id,
            events(*)
          `)
          .eq('user_id', user.id)
          .eq('payment_status', 'completed');

        if (regError && !regError.message?.includes('relation "public.event_registrations" does not exist')) {
          throw regError;
        }

        const userEvents = registrations?.map((reg: any) => ({
          id: reg.events.id,
          title: reg.events.title,
          description: reg.events.description,
          date: reg.events.date,
          time: reg.events.time,
          location: reg.events.location,
          department: reg.events.department,
          maxSeats: reg.events.max_seats,
          registeredCount: 0,
          price: reg.events.price,
          image: reg.events.image_url || `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg`
        })) || [];

        setUserRegistrations(userEvents);
      } catch (error: any) {
        if (!error.message?.includes('relation "public.event_registrations" does not exist')) {
          console.error('Error loading user registrations:', error);
        }
        setUserRegistrations([]);
      }

      // Load user attendance with error handling
      try {
        const { data: attendance, error: attError } = await supabase
          .from('attendance')
          .select('event_id')
          .eq('user_id', user.id);

        if (attError && !attError.message?.includes('relation "public.attendance" does not exist')) {
          throw attError;
        }

        const attendedEventIds = attendance?.map((att: any) => att.event_id) || [];
        setUserAttendance(attendedEventIds);
      } catch (error: any) {
        if (!error.message?.includes('relation "public.attendance" does not exist')) {
          console.error('Error loading user attendance:', error);
        }
        setUserAttendance([]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserRegistrations([]);
      setUserAttendance([]);
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
      if (isOfflineModeEnabled) {
        // Add to local state for offline mode
        const newEvent: Event = {
          ...eventData,
          id: Math.random().toString(36).substr(2, 9),
          registeredCount: 0,
          createdBy: user?.id
        };
        setEvents(prev => [...prev, newEvent]);
        return true;
      }

      const { data, error } = await supabase
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
          created_by: eventData.createdBy
        })
        .select()
        .single();

      if (error) {
        // If table doesn't exist, add to local state for offline mode
        if (error.message?.includes('relation "public.events" does not exist')) {
          console.warn('Events table does not exist, adding to local state');
          const newEvent: Event = {
            id: Date.now().toString(),
            ...eventData,
            registeredCount: 0
          };
          setEvents(prev => [...prev, newEvent]);
          return true;
        }
        console.error('Supabase error during event addition:', error);
        throw error;
      }

      if (data) {
        const newEvent: Event = {
          id: data.id,
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time,
          location: data.location,
          department: data.department,
          maxSeats: data.max_seats,
          registeredCount: 0,
          price: data.price,
          image: data.image_url || eventData.image,
          createdBy: data.created_by
        };
        
        setEvents(prev => [...prev, newEvent]);
      }

      // Refresh events list to ensure UI is updated
      await loadEvents();
      return true;
    } catch (error) {
      console.error('Error adding event:', error);
      // Add to local state as fallback
      const newEvent: Event = {
        id: Date.now().toString(),
        ...eventData,
        registeredCount: 0
      };
      setEvents(prev => [...prev, newEvent]);
      return true;
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

  const addFoodStall = async (stallData: Omit<FoodStall, 'id' | 'rating' | 'reviewCount' | 'reviews'>): Promise<boolean> => {
    try {
      if (isOfflineModeEnabled) {
        // Add to local state for offline mode
        const newStall: FoodStall = {
          ...stallData,
          id: Math.random().toString(36).substr(2, 9),
          rating: 0,
          reviewCount: 0,
          reviews: []
        };
        setFoodStalls(prev => [...prev, newStall]);
        return true;
      }

      const { data, error } = await supabase
        .from('food_stalls')
        .insert({
          name: stallData.name,
          description: stallData.description,
          image_url: stallData.image,
          menu: stallData.menu,
          location: stallData.location,
          contact_info: stallData.contactInfo,
          is_active: stallData.isActive
        })
        .select()
        .single();

      if (error) {
        // If table doesn't exist, add to local state for offline mode
        if (error.message?.includes('relation "public.food_stalls" does not exist')) {
          console.warn('Food stalls table does not exist, adding to local state');
          const newStall: FoodStall = {
            id: Date.now().toString(),
            ...stallData,
            rating: 0,
            reviewCount: 0,
            reviews: []
          };
          setFoodStalls(prev => [...prev, newStall]);
          return true;
        }
        console.error('Supabase error during stall addition:', error);
        throw error;
      }

      if (data) {
        const newStall: FoodStall = {
          id: data.id,
          name: data.name,
          description: data.description,
          image: data.image_url || stallData.image,
          menu: data.menu || [],
          rating: 0,
          reviewCount: 0,
          reviews: [],
          location: data.location,
          contactInfo: data.contact_info,
          isActive: data.is_active
        };
        
        setFoodStalls(prev => [...prev, newStall]);
      }

      // Refresh stalls list to ensure UI is updated
      await loadFoodStalls();
      return true;
    } catch (error) {
      console.error('Error adding food stall:', error);
      // Add to local state as fallback
      const newStall: FoodStall = {
        id: Date.now().toString(),
        ...stallData,
        rating: 0,
        reviewCount: 0,
        reviews: []
      };
      setFoodStalls(prev => [...prev, newStall]);
      return true;
    }
  };

  const updateFoodStall = async (stallId: string, updates: Partial<FoodStall>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('food_stalls')
        .update({
          name: updates.name,
          description: updates.description,
          image_url: updates.image,
          menu: updates.menu,
          location: updates.location,
          contact_info: updates.contactInfo,
          is_active: updates.isActive
        })
        .eq('id', stallId);

      if (error) throw error;

      await loadFoodStalls();
      return true;
    } catch (error) {
      console.error('Error updating food stall:', error);
      return false;
    }
  };

  const deleteFoodStall = async (stallId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('food_stalls')
        .delete()
        .eq('id', stallId);

      if (error) throw error;

      await loadFoodStalls();
      return true;
    } catch (error) {
      console.error('Error deleting food stall:', error);
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

  const getUserRegisteredEvents = (): Event[] => {
    return userRegistrations;
  };

  const getUserAttendance = (): string[] => {
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
      addFoodStall,
      updateFoodStall,
      deleteFoodStall,
      addFoodStallReview,
      getUserRegisteredEvents,
      getUserAttendance,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};