/**
 * HallPass Admin Portal Manager
 * Handles Admin authentication, KPI calculations, request tables, filters, CSV export, and action handlers.
 */

import { Storage } from './storage.js';

export class AdminPortal {
  constructor(options = {}) {
    this.currentFilter = 'all'; // 'all' | 'pending' | 'approved' | 'rejected'
    this.searchQuery = '';
    this.onDataChange = options.onDataChange || (() => {});
    this.showToast = options.showToast || (() => {});
  }

  init() {
    this.bindEvents();
    this.updateUI();
  }

  bindEvents() {
    // Admin Login Form
    const loginForm = document.getElementById('admin-login-form');
    loginForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const passInput = document.getElementById('admin-password-input');
      if (passInput.value === 'admin123') {
        Storage.setAdminAuthenticated(true);
        passInput.value = '';
        this.showToast('Login successful! Welcome Admin.', 'success');
        this.updateUI();
      } else {
        this.showToast('Invalid password! Demo password is: admin123', 'error');
      }
    });

    // Auto-fill demo password button
    document.getElementById('fill-demo-pass-btn')?.addEventListener('click', () => {
      const passInput = document.getElementById('admin-password-input');
      if (passInput) passInput.value = 'admin123';
    });

    // Admin Logout
    document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
      Storage.setAdminAuthenticated(false);
      this.showToast('Admin logged out successfully.', 'info');
      this.updateUI();
    });

    // Export CSV Button
    document.getElementById('export-csv-btn')?.addEventListener('click', () => {
      const csvData = Storage.exportCSV();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `HallPass_Bookings_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showToast('Bookings exported to CSV successfully!', 'success');
    });

    // Filter Tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        filterTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.getAttribute('data-filter') || 'all';
        this.renderTable();
      });
    });

    // Search Input
    const searchInput = document.getElementById('admin-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderTable();
    });

    // Settings Form
    const settingsForm = document.getElementById('admin-settings-form');
    settingsForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        hallName: document.getElementById('setting-hall-name').value,
        dailyRate: parseFloat(document.getElementById('setting-daily-rate').value) || 1500,
        bankName: document.getElementById('setting-bank-name').value,
        accountNumber: document.getElementById('setting-account-number').value,
        accountName: document.getElementById('setting-account-name').value,
        paymentDeadlineHours: parseInt(document.getElementById('setting-deadline-hours').value) || 48
      };
      Storage.updateSettings(updated);
      this.showToast('Venue & payment settings updated!', 'success');
      this.onDataChange();
    });

    // Reset Demo Data button
    document.getElementById('reset-demo-btn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all bookings to default demo data?')) {
        Storage.resetDemoData();
        this.showToast('Demo data reset successfully!', 'info');
        this.updateUI();
        this.onDataChange();
      }
    });
  }

  updateUI() {
    const isAuth = Storage.isAdminAuthenticated();
    const loginCard = document.getElementById('admin-login-card');
    const dashboardContent = document.getElementById('admin-dashboard-content');
    const logoutBtn = document.getElementById('admin-logout-btn');

    if (isAuth) {
      if (loginCard) loginCard.style.display = 'none';
      if (dashboardContent) dashboardContent.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      this.renderKPIs();
      this.renderTable();
      this.populateSettingsForm();
    } else {
      if (loginCard) loginCard.style.display = 'block';
      if (dashboardContent) dashboardContent.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }

  renderKPIs() {
    const bookings = Storage.getBookings();
    const settings = Storage.getSettings();

    const totalCount = bookings.length;
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const approvedCount = bookings.filter(b => b.status === 'approved').length;
    
    // Sum total price of approved events
    const estimatedRev = bookings
      .filter(b => b.status === 'approved')
      .reduce((sum, b) => sum + (b.totalPrice || settings.dailyRate), 0);

    const elTotal = document.getElementById('kpi-total');
    const elPending = document.getElementById('kpi-pending');
    const elApproved = document.getElementById('kpi-approved');
    const elRevenue = document.getElementById('kpi-revenue');

    if (elTotal) elTotal.textContent = totalCount;
    if (elPending) elPending.textContent = pendingCount;
    if (elApproved) elApproved.textContent = approvedCount;
    if (elRevenue) elRevenue.textContent = '$' + estimatedRev.toLocaleString();
  }

  renderTable() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;

    let bookings = Storage.getBookings();

    // Filter by status
    if (this.currentFilter !== 'all') {
      bookings = bookings.filter(b => b.status === this.currentFilter);
    }

    // Filter by search
    if (this.searchQuery) {
      bookings = bookings.filter(b => 
        b.customerName.toLowerCase().includes(this.searchQuery) ||
        b.email.toLowerCase().includes(this.searchQuery) ||
        b.id.toLowerCase().includes(this.searchQuery) ||
        b.eventType.toLowerCase().includes(this.searchQuery)
      );
    }

    if (bookings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
            No booking requests found matching your filter.
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    bookings.forEach(b => {
      const statusPillClass = b.status;
      const statusLabel = b.status.charAt(0).toUpperCase() + b.status.slice(1);
      const priceStr = '$' + (b.totalPrice || 1500).toLocaleString();

      html += `
        <tr>
          <td><strong>${b.id}</strong></td>
          <td>
            <div style="font-weight: 600;">${this.escapeHtml(b.customerName)}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${this.escapeHtml(b.email)}</div>
          </td>
          <td><strong>${b.date}</strong></td>
          <td>
            <div style="font-weight: 500;">${this.escapeHtml(b.eventType)}</div>
            <div style="font-size:0.8rem; color: var(--text-muted);">${b.guestCount} guests • ${b.layoutPreference || 'Banquet'}</div>
          </td>
          <td>
            <span class="status-pill ${statusPillClass}">${statusLabel}</span>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
              ${b.paymentStatus === 'fully_paid' ? '🟢 Paid' : b.paymentStatus === 'paid_deposit' ? '🟡 Deposit' : '🔴 Unpaid'} (${priceStr})
            </div>
          </td>
          <td>
            ${b.status === 'pending' ? `
              <button class="btn btn-success btn-sm btn-approve" data-id="${b.id}">Approve</button>
              <button class="btn btn-danger btn-sm btn-reject" data-id="${b.id}">Reject</button>
            ` : ''}
            ${b.status === 'approved' ? `
              <button class="btn btn-danger btn-sm btn-reject" data-id="${b.id}">Cancel</button>
            ` : ''}
            ${b.status === 'rejected' ? `
              <button class="btn btn-success btn-sm btn-approve" data-id="${b.id}">Re-Approve</button>
            ` : ''}
            <button class="btn btn-secondary btn-sm btn-details" data-id="${b.id}">Details</button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    // Attach Action Listeners
    tbody.querySelectorAll('.btn-approve').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        Storage.updateBookingStatus(id, 'approved');
        this.showToast(`Request ${id} approved! Calendar updated.`, 'success');
        this.renderKPIs();
        this.renderTable();
        this.onDataChange();
      });
    });

    tbody.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        Storage.updateBookingStatus(id, 'rejected');
        this.showToast(`Request ${id} rejected. Date is now free.`, 'info');
        this.renderKPIs();
        this.renderTable();
        this.onDataChange();
      });
    });

    tbody.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openDetailsModal(id);
      });
    });
  }

  openDetailsModal(id) {
    const booking = Storage.getBookingById(id);
    if (!booking) return;

    const modal = document.getElementById('details-modal');
    const modalBody = document.getElementById('details-modal-body');
    if (!modal || !modalBody) return;

    const addonsHtml = (booking.addons && booking.addons.length > 0)
      ? booking.addons.map(a => `<span style="display:inline-block; background:var(--bg-tertiary); padding:2px 8px; border-radius:4px; font-size:0.8rem; margin-right:4px;">${this.escapeHtml(a)}</span>`).join('')
      : '<span style="font-size:0.85rem; color:var(--text-muted);">No add-ons selected</span>';

    modalBody.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Ref ID:</span>
          <h4 style="font-size: 1.2rem;">${booking.id}</h4>
        </div>
        <span class="status-pill ${booking.status}">${booking.status.toUpperCase()}</span>
      </div>

      <div class="form-grid-2" style="margin-bottom: 1rem;">
        <div>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Customer Name</span>
          <p style="font-weight: 600;">${this.escapeHtml(booking.customerName)}</p>
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Requested Date</span>
          <p style="font-weight: 600; color: var(--primary);">${booking.date}</p>
        </div>
      </div>

      <div class="form-grid-2" style="margin-bottom: 1rem;">
        <div>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Contact Email</span>
          <p style="font-size: 0.9rem;">${this.escapeHtml(booking.email)}</p>
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Contact Phone</span>
          <p style="font-size: 0.9rem;">${this.escapeHtml(booking.phone)}</p>
        </div>
      </div>

      <div class="form-grid-2" style="margin-bottom: 1rem;">
        <div>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Event Type & Layout</span>
          <p style="font-weight: 500;">${this.escapeHtml(booking.eventType)} (${booking.layoutPreference || 'Banquet'})</p>
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Estimated Price</span>
          <p style="font-weight: 700; color: var(--status-available); font-size: 1.1rem;">$${(booking.totalPrice || 1500).toLocaleString()}</p>
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <span style="font-size: 0.8rem; color: var(--text-muted); display:block; margin-bottom:4px;">Selected Add-ons</span>
        <div>${addonsHtml}</div>
      </div>

      <div style="margin-bottom: 1rem;">
        <span style="font-size: 0.8rem; color: var(--text-muted);">Customer Transfer Ref Proof</span>
        <p style="font-weight: 600; font-size: 0.9rem; color: var(--primary);">
          ${booking.paymentRef ? this.escapeHtml(booking.paymentRef) : 'No reference submitted yet by customer.'}
        </p>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <span style="font-size: 0.8rem; color: var(--text-muted);">Special Requests / Notes</span>
        <p style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.9rem; margin-top: 0.3rem;">
          ${booking.notes ? this.escapeHtml(booking.notes) : 'None specified.'}
        </p>
      </div>

      <div class="form-group" style="margin-bottom: 0;">
        <label class="form-label">Update Payment Status (Offline Bank Audit)</label>
        <select class="form-control" id="details-payment-status">
          <option value="unpaid" ${booking.paymentStatus === 'unpaid' ? 'selected' : ''}>Unpaid (Awaiting Offline Transfer)</option>
          <option value="paid_deposit" ${booking.paymentStatus === 'paid_deposit' ? 'selected' : ''}>Paid Deposit (50%)</option>
          <option value="fully_paid" ${booking.paymentStatus === 'fully_paid' ? 'selected' : ''}>Fully Paid</option>
        </select>
      </div>
    `;

    modal.classList.add('open');

    // Handle Payment Status Save inside modal
    const saveBtn = document.getElementById('save-payment-status-btn');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const payVal = document.getElementById('details-payment-status')?.value;
        Storage.updateBookingStatus(booking.id, booking.status, payVal);
        this.showToast('Payment status updated!', 'success');
        modal.classList.remove('open');
        this.renderTable();
      };
    }
  }

  populateSettingsForm() {
    const s = Storage.getSettings();
    document.getElementById('setting-hall-name').value = s.hallName || '';
    document.getElementById('setting-daily-rate').value = s.dailyRate || 1500;
    document.getElementById('setting-bank-name').value = s.bankName || '';
    document.getElementById('setting-account-number').value = s.accountNumber || '';
    document.getElementById('setting-account-name').value = s.accountName || '';
    document.getElementById('setting-deadline-hours').value = s.paymentDeadlineHours || 48;
  }

  escapeHtml(str) {
    return (str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
}
