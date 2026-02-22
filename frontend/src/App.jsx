import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Verify from './pages/auth/Verify';

// Placeholder components - replace with actual components later
const Search = () => <div className="p-4">Search Page</div>;
const RideDetail = () => <div className="p-4">Ride Detail Page</div>;
const Profile = () => <div className="p-4">Profile Page</div>;
const ProfileEdit = () => <div className="p-4">Profile Edit Page</div>;
const Chat = () => <div className="p-4">Chat Page</div>;
const Notifications = () => <div className="p-4">Notifications Page</div>;
const DriverDashboard = () => <div className="p-4">Driver Dashboard</div>;
const PostRide = () => <div className="p-4">Post Ride Page</div>;
const DriverRides = () => <div className="p-4">My Rides</div>;
const DriverBookings = () => <div className="p-4">Driver Bookings</div>;
const PassengerDashboard = () => <div className="p-4">Passenger Dashboard</div>;
const PassengerBookings = () => <div className="p-4">Passenger Bookings</div>;

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
          <Route path="/search" element={<Search />} />
          <Route path="/rides/:id" element={<RideDetail />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
          <Route path="/chat/:bookingId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          
          {/* Driver Routes */}
          <Route path="/driver/dashboard" element={<RoleRoute role="driver"><DriverDashboard /></RoleRoute>} />
          <Route path="/post-ride" element={<RoleRoute role="driver"><PostRide /></RoleRoute>} />
          <Route path="/driver/rides" element={<RoleRoute role="driver"><DriverRides /></RoleRoute>} />
          <Route path="/driver/bookings" element={<RoleRoute role="driver"><DriverBookings /></RoleRoute>} />
          
          {/* Passenger Routes */}
          <Route path="/passenger/dashboard" element={<RoleRoute role="passenger"><PassengerDashboard /></RoleRoute>} />
          <Route path="/passenger/bookings" element={<RoleRoute role="passenger"><PassengerBookings /></RoleRoute>} />
        </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
