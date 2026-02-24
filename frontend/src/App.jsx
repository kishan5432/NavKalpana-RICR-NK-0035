import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { PageTransition } from './components/animations/PageTransitions';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Verify from './pages/auth/Verify';
import ForgotPassword from './pages/auth/ForgotPassword';
import SearchRides from './pages/passenger/SearchRides';
import RideDetail from './pages/shared/RideDetail';
import DriverDashboard from './pages/driver/DriverDashboard';
import CreateRide from './pages/driver/CreateRide';
import MyPostedRides from './pages/driver/MyPostedRides';
import BookingRequests from './pages/driver/BookingRequests';
import PassengerDashboard from './pages/passenger/PassengerDashboard';
import BookingHistory from './pages/passenger/BookingHistory';
import DriverRideDetail from './pages/driver/DriverRideDetail';
import EditRide from './pages/driver/EditRide';
import Chat from './pages/shared/Chat';
import Profile from './pages/shared/Profile';
import EditProfile from './pages/shared/EditProfile';
import Notifications from './pages/shared/Notifications';
import { useState, useEffect } from 'react';

const NotificationsPlaceholder = () => <div className="p-4">Notifications Page</div>;

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, role }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return user.role === role ? children : <Navigate to="/" />;
};

function AppRoutes() {
  const location = useLocation();
  const { isLoading } = useAuth();
  const [appLoading, setAppLoading] = useState(true);
  const hideFooter = ['/login', '/register', '/verify', '/forgot-password'].includes(location.pathname);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  
  if (appLoading || isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="pb-16 md:pb-0 flex-1">
        <PageTransition>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/search" element={<SearchRides />} />
          <Route path="/rides/:id" element={<RideDetail />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/chat/:bookingId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          
          {/* Driver Routes */}
          <Route path="/driver/dashboard" element={<RoleRoute role="driver"><DriverDashboard /></RoleRoute>} />
          <Route path="/post-ride" element={<RoleRoute role="driver"><CreateRide /></RoleRoute>} />
          <Route path="/driver/rides" element={<RoleRoute role="driver"><MyPostedRides /></RoleRoute>} />
          <Route path="/driver/rides/:id" element={<RoleRoute role="driver"><DriverRideDetail /></RoleRoute>} />
          <Route path="/driver/edit-ride/:id" element={<RoleRoute role="driver"><EditRide /></RoleRoute>} />
          <Route path="/driver/bookings" element={<RoleRoute role="driver"><BookingRequests /></RoleRoute>} />
          
          {/* Passenger Routes */}
          <Route path="/passenger/dashboard" element={<RoleRoute role="passenger"><PassengerDashboard /></RoleRoute>} />
          <Route path="/passenger/bookings" element={<RoleRoute role="passenger"><BookingHistory /></RoleRoute>} />
          </Routes>
        </PageTransition>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px'
                },
                duration: 5000
              }}
            />
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
