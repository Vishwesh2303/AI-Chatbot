import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Sparkles, Send } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: '🚀 Hello! I am your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    const botReply = { role: 'bot', text: generateReply(input) };

    setMessages([...messages, userMessage, botReply]);
    setInput('');
  };

  const generateReply = (userText) => {
    const lower = userText.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi')) return '🌟 Hi there! How can I assist you?';
    if (lower.includes('how are you')) return "🤖 I'm running at full capacity!";
    return "❓ Sorry, I don't understand that yet. Try something else!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-4 flex items-center justify-center font-sans">
      <Card className="w-full max-w-2xl shadow-xl rounded-3xl bg-[#0f172a] border border-indigo-500/30">
        <CardContent className="p-6 space-y-4">
          <div className="h-[500px] overflow-y-auto flex flex-col space-y-3 custom-scrollbar">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                className={`p-4 rounded-xl text-sm md:text-base font-medium max-w-[75%] ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white self-end shadow-lg'
                    : 'bg-gradient-to-br from-gray-800 to-gray-700 text-blue-100 self-start shadow'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {msg.text}
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-3">
            <Input
              className="flex-1 bg-[#1e293b] text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-indigo-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button
              onClick={handleSend}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg rounded-xl px-4"
            >
              <Send size={18} className="mr-1" /> Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chatbot;
