import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById } from '../../api';
import { useAuth } from '../../context/AuthContext';
import ChatWindow from '../../components/ChatWindow';
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

  if (!booking || !otherUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-[#111111]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-[#FFD400] text-[#111111] p-4 shadow-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-[#111111]/10 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#111111]/20 border-2 border-[#111111]">
            <img 
              src={otherUser.photo || '/default-avatar.png'} 
              alt={otherUser.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h2 className="font-semibold text-lg">{otherUser.name}</h2>
        </div>
      </div>
      
      {/* Chat Window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow bookingId={bookingId} otherUser={otherUser} />
      </div>
    </div>
  );
};

export default Chat;
