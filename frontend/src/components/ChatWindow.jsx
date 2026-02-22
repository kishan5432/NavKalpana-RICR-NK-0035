import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { getMessagesByBooking, sendMessage as sendMessageAPI, markMessagesRead } from '../api';
import { Avatar } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Send } from 'lucide-react';

const ChatWindow = ({ bookingId, otherUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { socket } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-room', bookingId);

    getMessagesByBooking(bookingId)
      .then(data => {
        setMessages(data.messages || []);
        markMessagesRead(bookingId).catch(() => {});
      })
      .catch(err => {
        console.error(err);
        setMessages([]);
      });

    return () => {
      socket.emit('leave-room', bookingId);
    };
  }, [socket, bookingId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      console.log('Received new message:', message);
      setMessages(prev => {
        if (message._id && prev.some(m => m._id === message._id)) {
          return prev;
        }
        if (!message._id && prev.some(m => 
          m.content === message.content && 
          Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 1000
        )) {
          return prev;
        }
        return [...prev, message];
      });
      markMessagesRead(bookingId).catch(() => {});
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const content = input.trim();
    setInput('');

    try {
      const response = await sendMessageAPI(bookingId, content);
      setMessages(prev => [...prev, response.message]);
      socket.emit('send-message', response.message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isMine = msg.senderId?._id === user._id || msg.sender === user._id;
          const sender = msg.senderId || { name: isMine ? user.name : otherUser.name, profilePhoto: isMine ? user.profilePhoto : otherUser.photo };
          return (
            <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[70%] ${isMine ? 'flex-row-reverse' : ''}`}>
                <Avatar className="w-8 h-8">
                  <img src={sender.profilePhoto || '/default-avatar.png'} alt={sender.name} />
                </Avatar>
                <div>
                  <div className="text-xs text-gray-600 mb-1">{sender.name}</div>
                  <div className={`rounded-lg px-4 py-2 ${isMine ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                    {msg.content}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${isMine ? 'text-right' : ''}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="resize-none"
            rows={2}
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
