import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import SearchComponent from '../ui/animated-glowing-search-bar';

interface Message {
  id: string;
  sender: 'Bot' | 'User' | 'System' | 'AI';
  text: string;
}

interface ChatbotWidgetProps {
  teamId?: string;
  userId?: string;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ teamId, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'Bot', text: 'Hi! I am your AI assistant. Ask me about deadlines, rooms, wifi, or request a coordinator.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only connect when opened to save resources
    if (!isOpen) return;

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('chat_reply', (data: { sender: any, message: string }) => {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: data.sender, text: data.message }]);
    });

    newSocket.on('chat_typing', (data: { isTyping: boolean }) => {
      setIsTyping(data.isTyping);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'User', text: input };
    setMessages(prev => [...prev, userMsg]);
    
    socket.emit('send_chat_message', {
      userId,
      teamId,
      message: input
    });

    setInput('');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:scale-105 transition-all z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-950 p-4 border-b border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-gray-200">Hackathon Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto max-h-96 min-h-[300px] space-y-4 custom-scrollbar bg-gray-900/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-2 max-w-[85%] ${msg.sender === 'User' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.sender === 'User' ? 'bg-blue-600' : msg.sender === 'System' ? 'bg-red-500' : 'bg-gray-700'}`}>
                      {msg.sender === 'User' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-white" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${
                      msg.sender === 'User' ? 'bg-blue-600 text-white rounded-tr-none' : 
                      msg.sender === 'System' ? 'bg-red-500/20 text-red-200 border border-red-500/30 rounded-tl-none' :
                      'bg-gray-800 text-gray-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="p-3 bg-gray-800 text-gray-200 rounded-2xl rounded-tl-none text-sm flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <span className="text-gray-400">Typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-gray-950 border-t border-gray-800 rounded-b-2xl">
              <SearchComponent 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                onSubmit={handleSend}
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
