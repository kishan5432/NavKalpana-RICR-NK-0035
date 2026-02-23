import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
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
import Chat from './pages/shared/Chat';
import Profile from './pages/shared/Profile';
import EditProfile from './pages/shared/EditProfile';
import Notifications from './pages/shared/Notifications';

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
  return (
    <>
      <Navbar />
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
          <Route path="/driver/bookings" element={<RoleRoute role="driver"><BookingRequests /></RoleRoute>} />
          
          {/* Passenger Routes */}
          <Route path="/passenger/dashboard" element={<RoleRoute role="passenger"><PassengerDashboard /></RoleRoute>} />
          <Route path="/passenger/bookings" element={<RoleRoute role="passenger"><BookingHistory /></RoleRoute>} />
        </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
