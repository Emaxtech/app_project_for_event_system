# 🏛️ Echelon Event Booking Portal

**Echelon Event Booking Portal** is a modern, responsive web application designed for customers to browse available event dates, select seating layouts, customize add-on services, and submit booking requests — while allowing venue administrators to review, approve, or reject reservations and manage offline bank payments.

Built strictly according to [PRD.MD.txt](PRD.MD.txt).

---

## ✨ Key Features

### 👥 Customer Experience (Public Hub)
- **Interactive Calendar Schedule**:
  - Live color-coded availability badges:
    - 🟢 **Available**: Free for new booking requests.
    - 🟡 **Pending Review**: Temporarily reserved while admin reviews an existing request.
    - 🔴 **Booked**: Confirmed event reservation.
  - Interactive month/year navigation with a quick "Today" jump.
- **Customizable Reservation Form**:
  - Full input validation (prevents picking past or already reserved dates).
  - **Floor Layout Selector**: Pick seating configurations (**Banquet Style**, **Theater Seating**, **Cocktail Party**, **U-Shape Conference**).
  - **Add-On Services & Dynamic Pricing**: Select optional venue upgrades (Stage Lighting +$300, Audio System +$200, Catering Access +$150, High-Speed Wi-Fi +$100) with a real-time cost breakdown calculator.
- **Offline Payment Instructions**:
  - Generates a unique Reference ID (e.g. `#ECHELON-7821`).
  - Displays bank details, account number, beneficiary name, and a 48-hour transfer deadline.
- **Customer Status Lookup & Proof Submission**:
  - Dedicated lookup tool allowing customers to enter their Ref ID or Email to check request status.
  - Form enabling customers to submit their bank transfer transaction reference for fast admin verification.

### 🛡️ Administrator Management Portal
- **Password Authentication**: Protected admin lock screen (`admin123`) with a single-click "Auto-fill Demo Password" button.
- **KPI Metrics Dashboard**: Real-time stats calculation for:
  - Total Booking Requests
  - Pending Review Count
  - Approved Events Count
  - Estimated Booked Revenue ($)
- **Filterable & Searchable Request Table**:
  - Filter tabs: **All Requests**, **Pending**, **Approved**, **Rejected**.
  - Live search by customer name, email, event type, or reference code.
  - One-Click Action Triggers: **Approve**, **Reject**, **Cancel Booking**, and **View Details**.
- **📊 CSV Data Export**: Download complete booking records as a `.csv` spreadsheet (`Echelon_Bookings_YYYY-MM-DD.csv`).
- **Venue & Payment Settings Editor**:
  - Editable Bank Name, Account Number, Account Beneficiary Name, Daily Hall Rate, and Payment Window Hours.
  - **Reset Demo Data**: Instantly restore pre-populated sample bookings for demonstration purposes.

### 🎨 Visual Aesthetics & Themes
- Modern typography via Google Fonts (`Outfit` & `Inter`).
- Soft glassmorphism cards, glowing status pill badges, dynamic modal dialogs, animated toast feedback.
- Toggleable **Dark / Light Theme** mode with persistence.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: HTML5, Modular ES6+ JavaScript, Vanilla CSS Design System (Custom properties, CSS Grid/Flexbox, Glassmorphism).
- **Backend / Dev Server**: Zero-dependency Node.js HTTP server (`server.js`).
- **Data Persistence**: Web `localStorage` with initial seed demo data.
- **Dependencies**: Zero external npm runtime dependencies required.

---

## 📂 Directory Structure

```
event mgt app/
├── index.html            # Main HTML layout & modal templates
├── styles.css            # Custom CSS design system, dark/light themes, calendar & table styles
├── server.js            # Zero-dependency Node static file HTTP server
├── vercel.json          # 1-click Vercel internet deployment configuration
├── netlify.toml         # 1-click Netlify internet deployment configuration
├── PRD.MD.txt           # Product Requirements Document
├── README.md            # Documentation & setup guide
├── assets/
│   └── hero-hall.jpg    # Event hall hero showcase banner image
└── js/
    ├── app.js           # Core application bootstrap, navigation & modal controllers
    ├── storage.js       # LocalStorage state management, seed data & CSV exporter
    ├── calendar.js      # Interactive monthly calendar rendering engine
    └── admin.js         # Admin portal, authentication, KPI calculations & table manager
```

---

## 🚀 Quick Start (Local Server)

1. Open your terminal in the project root directory:
   ```bash
   c:\Users\hp\Desktop\event mgt app
   ```

2. Start the local server:
   ```bash
   node server.js
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

4. Admin Login Credentials:
   - **Password**: `admin123`

---

## 🌐 Internet Hosting & Public URL Deployment

To publish this application to the web with a live public URL, choose any of the following 100% free hosting platforms:

### Option 1: Netlify Drop (10 Seconds, No Code)
1. Visit **[app.netlify.com/drop](https://app.netlify.com/drop)** in your browser.
2. Drag and drop the `event mgt app` folder into the upload box.
3. Instantly receive your live public URL (e.g. `https://hallpass-events.netlify.app`).

### Option 2: Vercel
1. Sign up for a free account at **[vercel.com](https://vercel.com)**.
2. Click **Add New Project** → Import/Upload the project folder.
3. Click **Deploy** to get a free `.vercel.app` public address.

### Option 3: GitHub Pages
1. Push this repository to **[GitHub](https://github.com)**.
2. Navigate to **Settings** → **Pages**.
3. Select `main` branch and click **Save**.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
