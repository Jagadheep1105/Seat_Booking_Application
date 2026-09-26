import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ReservationProvider } from './context/ReservationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { LandingPage } from './pages/LandingPage';
import { EventDiscoveryPage } from './pages/EventDiscoveryPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { BookingHistoryPage } from './pages/BookingHistoryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <ReservationProvider>
            <div className="flex flex-col min-h-screen bg-dark-950 text-slate-100 font-sans">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/events" element={<EventDiscoveryPage />} />
                  <Route path="/events/:id" element={<EventDetailPage />} />
                  <Route path="/events/:id/seats" element={<SeatSelectionPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
                  <Route path="/bookings" element={<BookingHistoryPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </ReservationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
