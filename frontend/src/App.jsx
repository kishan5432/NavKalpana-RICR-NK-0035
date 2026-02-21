import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Placeholder components (to be created later)
const Home = () => <div>Home</div>;
const Login = () => <div>Login</div>;
const Register = () => <div>Register</div>;
const Search = () => <div>Search</div>;
const RideDetail = () => <div>Ride Detail</div>;
const Profile = () => <div>Profile</div>;
const ProfileEdit = () => <div>Profile Edit</div>;
const Chat = () => <div>Chat</div>;
const Notifications = () => <div>Notifications</div>;
const DriverDashboard = () => <div>Driver Dashboard</div>;
const DriverCreate = () => <div>Create Ride</div>;
const DriverRides = () => <div>My Rides</div>;
const DriverBookings = () => <div>Driver Bookings</div>;
const PassengerDashboard = () => <div>Passenger Dashboard</div>;
const PassengerBookings = () => <div>Passenger Bookings</div>;

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
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={<Search />} />
      <Route path="/rides/:id" element={<RideDetail />} />
      
      <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
      <Route path="/chat/:bookingId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      
      <Route path="/driver/dashboard" element={<RoleRoute role="driver"><DriverDashboard /></RoleRoute>} />
      <Route path="/driver/create" element={<RoleRoute role="driver"><DriverCreate /></RoleRoute>} />
      <Route path="/driver/rides" element={<RoleRoute role="driver"><DriverRides /></RoleRoute>} />
      <Route path="/driver/bookings" element={<RoleRoute role="driver"><DriverBookings /></RoleRoute>} />
      
      <Route path="/passenger/dashboard" element={<RoleRoute role="passenger"><PassengerDashboard /></RoleRoute>} />
      <Route path="/passenger/bookings" element={<RoleRoute role="passenger"><PassengerBookings /></RoleRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
