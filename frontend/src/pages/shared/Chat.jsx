import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById } from '../../api';
import { useAuth } from '../../context/AuthContext';
import ChatWindow from '../../components/ChatWindow';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Chat = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    getBookingById(bookingId)
      .then(data => {
        setBooking(data.booking);
        const isPassenger = data.booking.passengerId._id === user._id;
        const other = isPassenger ? data.booking.driverId : data.booking.passengerId;
        setOtherUser({
          name: other.name,
          photo: other.profilePhoto
        });
      })
      .catch(err => console.error('Error:', err));
  }, [bookingId, user]);

  if (!booking || !otherUser) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="border-b p-4 flex items-center gap-4 bg-white shadow-sm z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="w-10 h-10 shrink-0">
          <img src={otherUser.photo || '/default-avatar.png'} alt={otherUser.name} />
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{otherUser.name}</h2>
          <Badge variant="secondary" className="text-xs">Booking Status: {booking.status}</Badge>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatWindow bookingId={bookingId} otherUser={otherUser} />
      </div>
    </div>
  );
};

export default Chat;
