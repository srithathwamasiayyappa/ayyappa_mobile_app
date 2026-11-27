import { DevotionalNotification, NotificationPreferences } from '../types';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  liveStreams: true,
  templeFestivals: true,
  annadanam: true,
  panchangam: true,
  sevaReminders: true,
};

export const MASTER_NOTIFICATIONS: DevotionalNotification[] = [
  {
    id: 'notif-1',
    type: 'live',
    title: 'Mandala Pooja Live',
    message: 'Ayyappa Abhishekam at Sabarimala today at 6:00 PM.',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 min ago
    relativeTime: '10 min ago',
    isRead: false,
    destinationType: 'live_streams',
    destinationId: 'sabarimala-live',
    destinationTitle: 'Sabarimala Live Darshan',
  },
  {
    id: 'notif-2',
    type: 'festival',
    title: 'Festival Update',
    message: 'Karthika Pournami celebrations Tomorrow.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hr ago
    relativeTime: '2 hr ago',
    isRead: false,
    destinationType: 'temple_detail',
    destinationId: 'srisailam-temple',
    destinationTitle: 'Srisailam Temple',
  },
  {
    id: 'notif-3',
    type: 'annadanam',
    title: 'Annadanam Today',
    message: 'Food donation at Srisailam from 11:00 AM onwards.',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hr ago
    relativeTime: '3 hr ago',
    isRead: true,
    destinationType: 'food_donation',
    destinationId: 'srisailam-annadanam',
    destinationTitle: 'Food Donation (Annadanam)',
  },
  {
    id: 'notif-4',
    type: 'seva',
    title: 'Temple Seva Reminder',
    message: 'Your booked Archana is scheduled for 16 Jan 2025.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    relativeTime: 'Yesterday',
    isRead: true,
    destinationType: 'donations',
    destinationId: 'temple-seva',
    destinationTitle: 'Temple Seva Booking',
  },
  {
    id: 'notif-5',
    type: 'panchangam',
    title: 'Panchangam Alert',
    message: 'Auspicious time for Griha Pravesham tomorrow: 09:12 AM – 10:35 AM.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hr ago
    relativeTime: '2 hr ago',
    isRead: true,
    destinationType: 'panchangam',
    destinationId: 'panchangam',
    destinationTitle: 'Daily Panchangam',
  },
];

