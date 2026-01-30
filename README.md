# HealthPoint - Smart Queue Intelligence

HealthPoint is a next-generation patient experience platform designed to revolutionize hospital waiting rooms. It solves the problem of unpredictable waiting times by providing real-time queue intelligence and a seamless appointment booking flow.

Built for the **WebX** event under **Technavya**, hosted at **GLA University, Mathura**.

---

## 🚀 Key Features

- **Smart Queue Intelligence**: Real-time tracking of patient flow and department load.
- **Instant Token Generation**: "Quick Token" feature for walk-in patients with zero signup required.
- **Admin Command Center**: A powerful dashboard for hospital administrators to monitor live activity, manage staff presence, and approve appointment requests.
- **Secure Authentication**: Google-integrated login for administrators and verified appointment bookings.
- **Predictive Wait Times**: Smart algorithms that estimate waiting periods based on live staff activity.
- **Appointment Approval**: Dedicated workflow for admins to confirm bookings with automated email notifications.
- **Premium UI/UX**: A state-of-the-art, glassmorphism-inspired design with full dark/light mode support.

---

## 👥 Meet Team WebARC

| Name | Role |
| :--- | :--- |
| **Prabhu Tridev** | **Team Leader** |
| **Abhiyank** | Core Member |
| **Chirag** | Core Member |
| **Shashwat Saxena** | Core Member |

**College:** GLA University, Mathura  
**Event:** Technavya - WebX

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Server Components)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Google Authentication)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

---

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or later)
- Firebase Project

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd webarc
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the root directory and add your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Access the app**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License

Developed as part of the WebX competition. All rights reserved by Team WebARC.
