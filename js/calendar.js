/**
 * HallPass Calendar Renderer & Interactive Logic
 */

import { Storage } from './storage.js';

export class Calendar {
  constructor(containerId, onSelectDateCallback) {
    this.container = document.getElementById(containerId);
    this.currentDate = new Date();
    this.onSelectDate = onSelectDateCallback;
  }

  init() {
    this.render();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
  }

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
  }

  goToday() {
    this.currentDate = new Date();
    this.render();
  }

  render() {
    if (!this.container) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const todayStr = this.formatDateStr(new Date());
    const bookings = Storage.getBookings();

    // Create a map of date string -> booking details
    const bookingMap = {};
    bookings.forEach(b => {
      // Only active bookings block or mark dates
      if (b.status === 'approved' || b.status === 'pending') {
        bookingMap[b.date] = b;
      }
    });

    // Calendar math
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayIndex = firstDayOfMonth.getDay(); // 0 = Sunday
    const totalDays = lastDayOfMonth.getDate();

    let html = `
      <div class="calendar-controls">
        <h3 class="calendar-month-title">${monthNames[month]} ${year}</h3>
        <div class="calendar-nav-group">
          <button class="btn btn-secondary btn-sm" id="cal-today-btn">Today</button>
          <button class="btn btn-secondary btn-icon btn-sm" id="cal-prev-btn" title="Previous Month">
            <i class="fa-solid fa-chevron-left"></i> &larr;
          </button>
          <button class="btn btn-secondary btn-icon btn-sm" id="cal-next-btn" title="Next Month">
            <i class="fa-solid fa-chevron-right"></i> &rarr;
          </button>
        </div>
      </div>

      <div class="calendar-grid">
        <div class="calendar-day-header">Sun</div>
        <div class="calendar-day-header">Mon</div>
        <div class="calendar-day-header">Tue</div>
        <div class="calendar-day-header">Wed</div>
        <div class="calendar-day-header">Thu</div>
        <div class="calendar-day-header">Fri</div>
        <div class="calendar-day-header">Sat</div>
    `;

    // Blank cells before day 1
    for (let i = 0; i < startDayIndex; i++) {
      html += `<div class="calendar-day-cell empty"></div>`;
    }

    // Days 1..totalDays
    for (let day = 1; day <= totalDays; day++) {
      const cellDateObj = new Date(year, month, day);
      const dateStr = this.formatDateStr(cellDateObj);
      const isPast = cellDateObj < new Date(new Date().setHours(0,0,0,0));
      const isToday = dateStr === todayStr;
      const existingBooking = bookingMap[dateStr];

      let cellClass = 'calendar-day-cell';
      let badgeHtml = '';
      let statusType = 'available';

      if (isPast) {
        cellClass += ' disabled';
        badgeHtml = `<span class="calendar-status-badge past">Past</span>`;
      } else if (existingBooking) {
        if (existingBooking.status === 'approved') {
          statusType = 'booked';
          cellClass += ' booked-cell';
          badgeHtml = `<span class="calendar-status-badge booked"><i class="fa-solid fa-lock"></i> Booked</span>`;
        } else if (existingBooking.status === 'pending') {
          statusType = 'pending';
          cellClass += ' pending-cell';
          badgeHtml = `<span class="calendar-status-badge pending"><i class="fa-solid fa-clock"></i> Pending</span>`;
        }
      } else {
        badgeHtml = `<span class="calendar-status-badge available"><i class="fa-solid fa-circle-check"></i> Available</span>`;
      }

      if (isToday) {
        cellClass += ' today';
      }

      html += `
        <div class="${cellClass}" data-date="${dateStr}" data-status="${statusType}">
          <div class="calendar-day-number">${day}</div>
          ${badgeHtml}
        </div>
      `;
    }

    html += `</div>`;
    this.container.innerHTML = html;

    // Attach control listeners
    document.getElementById('cal-prev-btn')?.addEventListener('click', () => this.prevMonth());
    document.getElementById('cal-next-btn')?.addEventListener('click', () => this.nextMonth());
    document.getElementById('cal-today-btn')?.addEventListener('click', () => this.goToday());

    // Attach date cell click listeners
    const dayCells = this.container.querySelectorAll('.calendar-day-cell:not(.empty)');
    dayCells.forEach(cell => {
      cell.addEventListener('click', () => {
        const dateStr = cell.getAttribute('data-date');
        const status = cell.getAttribute('data-status');
        if (this.onSelectDate) {
          this.onSelectDate(dateStr, status);
        }
      });
    });
  }

  formatDateStr(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
