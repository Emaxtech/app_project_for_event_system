# 🏛️ HallPass — Event Hall Reservation & Management App
**HallPass** is a modern, responsive web application designed for customers to browse available event dates, select seating layouts, customize add-on services, and submit booking requests — while allowing venue administrators to review, approve, or reject reservations and manage offline bank payments.
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
  - Generates a unique Reference ID (e.g. `#HALL-7821`).
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
