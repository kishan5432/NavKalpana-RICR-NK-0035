import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { getMessagesByBooking, sendMessage as sendMessageAPI, markMessagesRead } from '../api';
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
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isMine = msg.senderId?._id === user._id || msg.sender === user._id;
          return (
            <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isMine ? 'bg-[#FFD400] text-[#111111]' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-3 shadow-sm`}>
                <p className="text-sm">{msg.content}</p>
                <div className={`text-xs mt-1 ${isMine ? 'text-[#4F4F4F]' : 'text-gray-500'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/20 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-[#111111] text-white p-3 rounded-full hover:bg-[#222222] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
