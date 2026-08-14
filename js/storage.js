/**
 * HallPass Storage Manager
 * Handles local persistence, mock data seed, CSV exports, CRUD operations for bookings & settings.
 */

const STORAGE_KEYS = {
  BOOKINGS: 'echelon_bookings',
  SETTINGS: 'echelon_settings',
  ADMIN_AUTH: 'echelon_admin_auth'
};

// Default Venue Settings
const DEFAULT_SETTINGS = {
  hallName: 'The Echelon Grand Ballroom',
  dailyRate: 1500,
  capacity: 500,
  bankName: 'Echelon Apex International Bank',
  accountNumber: '4092-8819-2041',
  accountName: 'Echelon Event Management Ltd',
  paymentDeadlineHours: 48,
  contactPhone: '+1 (800) 555-ECHELON',
  contactEmail: 'bookings@echelonevents.com'
};

// Helper: Format date as YYYY-MM-DD
function formatDateStr(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Seed initial realistic bookings for demonstration
function generateSeedBookings() {
  const today = new Date();
  
  const d1 = new Date(today); d1.setDate(today.getDate() + 4);
  const d2 = new Date(today); d2.setDate(today.getDate() + 9);
  const d3 = new Date(today); d3.setDate(today.getDate() + 15);
  const d4 = new Date(today); d4.setDate(today.getDate() + 21);
  const d5 = new Date(today); d5.setDate(today.getDate() + 27);

  return [
    {
      id: 'ECHELON-7821',
      date: formatDateStr(d1),
      customerName: 'Eleanor Vance',
      email: 'eleanor.vance@example.com',
      phone: '+1 (555) 234-5678',
      eventType: 'Wedding Reception',
      guestCount: 250,
      layoutPreference: 'Banquet Style',
      addons: ['Premium Lighting & Stage (+$300)', 'Audio System & Mics (+$200)'],
      totalPrice: 2000,
      notes: 'Requires stage setup and banquet table layout.',
      status: 'approved', // Approved blocks calendar (Red)
      paymentStatus: 'paid_deposit',
      paymentRef: 'TXN-99418274',
      createdAt: new Date(today.getTime() - 86400000 * 3).toISOString()
    },
    {
      id: 'ECHELON-4932',
      date: formatDateStr(d2),
      customerName: 'Marcus Sterling',
      email: 'm.sterling@techcorp.io',
      phone: '+1 (555) 876-5432',
      eventType: 'Corporate Conference',
      guestCount: 350,
      layoutPreference: 'Theater Seating',
      addons: ['Audio System & Mics (+$200)', 'High-Speed Wi-Fi (+$100)'],
      totalPrice: 1800,
      notes: 'Need projector screen, podium, and high-speed Wi-Fi.',
      status: 'pending', // Pending temporarily blocks calendar (Amber)
      paymentStatus: 'unpaid',
      paymentRef: '',
      createdAt: new Date(today.getTime() - 86400000 * 1).toISOString()
    },
    {
      id: 'ECHELON-9104',
      date: formatDateStr(d3),
      customerName: 'Sophia Martinez',
      email: 'sophia.m@glick.org',
      phone: '+1 (555) 345-6789',
      eventType: 'Gala & Charity Dinner',
      guestCount: 180,
      layoutPreference: 'Banquet Style',
      addons: ['Catering Kitchen Access (+$150)'],
      totalPrice: 1650,
      notes: 'Catering vendor setup required by 2:00 PM.',
      status: 'approved',
      paymentStatus: 'fully_paid',
      paymentRef: 'TXN-77310029',
      createdAt: new Date(today.getTime() - 86400000 * 5).toISOString()
    },
    {
      id: 'ECHELON-3312',
      date: formatDateStr(d4),
      customerName: 'David & Hannah Smith',
      email: 'hsmith@weddings.com',
      phone: '+1 (555) 987-6543',
      eventType: 'Wedding Ceremony',
      guestCount: 400,
      layoutPreference: 'Banquet Style',
      addons: ['Premium Lighting & Stage (+$300)'],
      totalPrice: 1800,
      notes: 'Floral arrangement access from morning.',
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentRef: '',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ECHELON-1289',
      date: formatDateStr(d5),
      customerName: 'Oliver Queen',
      email: 'oliver@starling.com',
      phone: '+1 (555) 111-2233',
      eventType: 'Birthday Celebration',
      guestCount: 120,
      layoutPreference: 'Cocktail Party',
      addons: ['Audio System & Mics (+$200)'],
      totalPrice: 1700,
      notes: 'DJ booth setup space needed.',
      status: 'rejected', // Rejected keeps date available
      paymentStatus: 'unpaid',
      paymentRef: '',
      createdAt: new Date(today.getTime() - 86400000 * 7).toISOString()
    }
  ];
}

export const Storage = {
  // Initialize storage if missing
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(generateSeedBookings()));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
  },

  // Get all bookings
  getBookings() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS)) || [];
    } catch (e) {
      console.error('Failed to parse bookings from storage:', e);
      return [];
    }
  },

  // Get single booking by ID or Email search
  getBookingById(idOrRef) {
    const bookings = this.getBookings();
    const query = idOrRef.trim().toLowerCase();
    return bookings.find(b => b.id.toLowerCase() === query || b.email.toLowerCase() === query) || null;
  },

  // Check if a specific YYYY-MM-DD date is unavailable (Pending or Approved)
  isDateBlocked(dateStr) {
    const bookings = this.getBookings();
    return bookings.some(b => b.date === dateStr && (b.status === 'pending' || b.status === 'approved'));
  },

  // Add new booking request
  addBooking(bookingData) {
    const bookings = this.getBookings();
    
    // Double check conflict
    if (this.isDateBlocked(bookingData.date)) {
      throw new Error('This date has already been requested or booked.');
    }

    const refId = 'ECHELON-' + Math.floor(1000 + Math.random() * 9000);
    const newBooking = {
      id: refId,
      ...bookingData,
      status: 'pending', // Per PRD, pending immediately blocks re-requesting date
      paymentStatus: 'unpaid',
      paymentRef: '',
      createdAt: new Date().toISOString()
    };

    bookings.push(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return newBooking;
  },

  // Update booking status ('pending' | 'approved' | 'rejected')
  updateBookingStatus(id, newStatus, paymentStatus = null, paymentRef = null) {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings[index].status = newStatus;
      if (paymentStatus) {
        bookings[index].paymentStatus = paymentStatus;
      }
      if (paymentRef !== null) {
        bookings[index].paymentRef = paymentRef;
      }
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      return bookings[index];
    }
    return null;
  },

  // Customer submit payment proof reference
  submitPaymentProof(id, proofRef) {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings[index].paymentRef = proofRef;
      if (bookings[index].paymentStatus === 'unpaid') {
        bookings[index].paymentStatus = 'paid_deposit';
      }
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      return bookings[index];
    }
    return null;
  },

  // Get venue settings
  getSettings() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  // Update venue settings
  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // Admin Auth State
  isAdminAuthenticated() {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  },

  setAdminAuthenticated(authBool) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, authBool ? 'true' : 'false');
  },

  // Reset demo data
  resetDemoData() {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(generateSeedBookings()));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  },

  // Export Bookings as CSV string
  exportCSV() {
    const bookings = this.getBookings();
    const headers = ['Ref ID', 'Customer Name', 'Email', 'Phone', 'Requested Date', 'Event Type', 'Guests', 'Layout', 'Status', 'Payment Status', 'Payment Ref', 'Total Price ($)'];
    
    const rows = bookings.map(b => [
      `"${b.id}"`,
      `"${b.customerName}"`,
      `"${b.email}"`,
      `"${b.phone}"`,
      `"${b.date}"`,
      `"${b.eventType}"`,
      b.guestCount,
      `"${b.layoutPreference || 'Banquet'}"`,
      `"${b.status}"`,
      `"${b.paymentStatus}"`,
      `"${b.paymentRef || ''}"`,
      b.totalPrice || 1500
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};
