/**
 * HallPass Application Core Bootstrap & Controllers
 */

import { Storage } from './storage.js';
import { Calendar } from './calendar.js';
import { AdminPortal } from './admin.js';

class App {
  constructor() {
    this.calendar = null;
    this.adminPortal = null;
    this.selectedDate = null;
    this.selectedLayout = 'Banquet Style';
  }

  init() {
    // Initialize storage
    Storage.init();

    // Setup Theme
    this.initTheme();

    // Toast Container
    this.initToastContainer();

    // Setup Calendar
    this.calendar = new Calendar('calendar-container', (dateStr, status) => {
      this.handleDateSelect(dateStr, status);
    });
    this.calendar.init();

    // Setup Admin Portal
    this.adminPortal = new AdminPortal({
      onDataChange: () => this.calendar.render(),
      showToast: (msg, type) => this.showToast(msg, type)
    });
    this.adminPortal.init();

    // Attach Event Listeners
    this.bindEvents();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('hallpass_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);

    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('hallpass_theme', next);
      this.updateThemeIcon(next);
    });
  }

  updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      btn.title = `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`;
    }
  }

  initToastContainer() {
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  bindEvents() {
    // Navigation Tabs
    const navLinks = document.querySelectorAll('.nav-link[data-target]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        this.switchSection(targetId);
      });
    });

    // Book Now Hero CTA
    document.getElementById('hero-book-now-btn')?.addEventListener('click', () => {
      this.openBookingModal();
    });

    // Close Modals
    document.querySelectorAll('.modal-close, [data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
      });
    });

    // Backdrop click close
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('open');
        }
      });
    });

    // Layout option selection in booking modal
    const layoutCards = document.querySelectorAll('.layout-option-card');
    layoutCards.forEach(card => {
      card.addEventListener('click', () => {
        layoutCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedLayout = card.getAttribute('data-layout') || 'Banquet Style';
      });
    });

    // Addons calculation change
    const addonCheckboxes = document.querySelectorAll('.addon-checkbox');
    addonCheckboxes.forEach(chk => {
      chk.addEventListener('change', () => this.updatePriceCalculation());
    });

    // Lookup Form Search
    const lookupForm = document.getElementById('lookup-request-form');
    lookupForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const refInput = document.getElementById('lookup-ref-input').value.trim();
      if (!refInput) return;
      this.handleLookupSearch(refInput);
    });

    // Customer Booking Form Submit
    const bookingForm = document.getElementById('booking-request-form');
    bookingForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleBookingSubmit();
    });

    // Submit Payment Reference Form
    const proofForm = document.getElementById('payment-proof-form');
    proofForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const refId = document.getElementById('proof-ref-id-hidden').value;
      const proofTxn = document.getElementById('proof-txn-input').value.trim();

      if (!proofTxn) {
        this.showToast('Please enter a valid bank transaction ID or payment reference.', 'error');
        return;
      }

      Storage.submitPaymentProof(refId, proofTxn);
      this.showToast('Payment proof submitted! Admin will audit your transfer.', 'success');
      document.getElementById('payment-modal')?.classList.remove('open');
    });
  }

  switchSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.style.display = 'none');

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
      activeSection.style.display = 'block';
    }

    // Update Nav Active state
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-target') === sectionId);
    });

    if (sectionId === 'admin-section') {
      this.adminPortal.updateUI();
    }
  }

  handleDateSelect(dateStr, status) {
    if (status === 'past') {
      this.showToast('Past dates cannot be booked.', 'error');
      return;
    }

    if (status === 'booked') {
      this.showToast('This date is already booked for a confirmed event.', 'error');
      return;
    }

    if (status === 'pending') {
      this.showToast('This date is currently pending admin review.', 'info');
      return;
    }

    // Status is available
    this.openBookingModal(dateStr);
  }

  openBookingModal(dateStr = null) {
    const modal = document.getElementById('booking-modal');
    const dateInput = document.getElementById('book-date-input');

    if (!dateStr) {
      // Pick tomorrow as default
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const y = tomorrow.getFullYear();
      const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const d = String(tomorrow.getDate()).padStart(2, '0');
      dateStr = `${y}-${m}-${d}`;
    }

    this.selectedDate = dateStr;
    if (dateInput) {
      dateInput.value = dateStr;
      dateInput.min = new Date().toISOString().split('T')[0];
    }

    this.updatePriceCalculation();

    if (modal) modal.classList.add('open');
  }

  updatePriceCalculation() {
    const settings = Storage.getSettings();
    const baseRate = settings.dailyRate || 1500;

    let addonsCost = 0;
    document.querySelectorAll('.addon-checkbox:checked').forEach(chk => {
      addonsCost += parseFloat(chk.getAttribute('data-price')) || 0;
    });

    const total = baseRate + addonsCost;

    const baseEl = document.getElementById('calc-base-price');
    const addonsEl = document.getElementById('calc-addons-price');
    const totalEl = document.getElementById('calc-total-price');

    if (baseEl) baseEl.textContent = `$${baseRate.toLocaleString()}`;
    if (addonsEl) addonsEl.textContent = `$${addonsCost.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `$${total.toLocaleString()}`;

    const rateEl = document.getElementById('booking-modal-rate');
    if (rateEl) {
      rateEl.textContent = `Total Estimated: $${total.toLocaleString()}`;
    }
  }

  handleBookingSubmit() {
    const name = document.getElementById('book-name-input').value.trim();
    const email = document.getElementById('book-email-input').value.trim();
    const phone = document.getElementById('book-phone-input').value.trim();
    const eventType = document.getElementById('book-event-type-input').value;
    const date = document.getElementById('book-date-input').value;
    const guestCount = parseInt(document.getElementById('book-guests-input').value) || 100;
    const notes = document.getElementById('book-notes-input').value.trim();

    if (!name || !email || !phone || !date) {
      this.showToast('Please fill in all required fields.', 'error');
      return;
    }

    // Validate if date is already taken
    if (Storage.isDateBlocked(date)) {
      this.showToast('Selected date has already been requested or booked by another customer.', 'error');
      return;
    }

    const settings = Storage.getSettings();
    const baseRate = settings.dailyRate || 1500;

    const selectedAddons = [];
    let addonsCost = 0;
    document.querySelectorAll('.addon-checkbox:checked').forEach(chk => {
      const price = parseFloat(chk.getAttribute('data-price')) || 0;
      addonsCost += price;
      selectedAddons.push(`${chk.getAttribute('data-name')} (+$${price})`);
    });

    const totalPrice = baseRate + addonsCost;

    try {
      const newBooking = Storage.addBooking({
        customerName: name,
        email,
        phone,
        eventType,
        date,
        guestCount,
        layoutPreference: this.selectedLayout,
        addons: selectedAddons,
        totalPrice,
        notes
      });

      // Close Booking Form Modal
      document.getElementById('booking-modal')?.classList.remove('open');

      // Reset form
      document.getElementById('booking-request-form')?.reset();

      // Refresh calendar immediately
      this.calendar.render();

      // Show Confirmation & Offline Payment Modal
      this.showOfflinePaymentConfirmation(newBooking);

      this.showToast('Booking request submitted! Date reserved pending admin approval.', 'success');
    } catch (err) {
      this.showToast(err.message || 'Error submitting booking request.', 'error');
    }
  }

  showOfflinePaymentConfirmation(booking) {
    const settings = Storage.getSettings();
    const modal = document.getElementById('payment-modal');
    if (!modal) return;

    document.getElementById('pay-modal-ref').textContent = booking.id;
    document.getElementById('pay-modal-ref-sub').textContent = booking.id;
    document.getElementById('pay-modal-date').textContent = booking.date;
    document.getElementById('pay-modal-bank').textContent = settings.bankName;
    document.getElementById('pay-modal-account-no').textContent = settings.accountNumber;
    document.getElementById('pay-modal-account-name').textContent = settings.accountName;
    document.getElementById('pay-modal-deadline').textContent = `${settings.paymentDeadlineHours} hours`;
    document.getElementById('proof-ref-id-hidden').value = booking.id;

    modal.classList.add('open');
  }

  handleLookupSearch(refOrEmail) {
    const booking = Storage.getBookingById(refOrEmail);
    if (!booking) {
      this.showToast(`No booking found matching "${refOrEmail}". Please check your Ref ID or Email.`, 'error');
      return;
    }

    this.showOfflinePaymentConfirmation(booking);
  }
}

// Bootstrap on DOMReady
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
