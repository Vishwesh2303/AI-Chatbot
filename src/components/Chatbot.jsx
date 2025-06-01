import React, { useState, useRef, useEffect, Suspense } from 'react';
import axios from 'axios';
import { Typewriter } from 'react-simple-typewriter';
import { Send, User, Cpu } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';
import './Chatbot.css';

// Iron Man Model Component
const IronManModel = () => {
  const { scene } = useGLTF('/models/iron_man.glb');
  return <primitive object={scene} scale={0.8} position={[0, -1.2, 0]} />;
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: '⚙️ Initializing... Welcome, Commander. How can I assist you today?',
      typewriter: true,
    },
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to call Hugging Face Inference API
  const fetchAIResponse = async (prompt) => {
  setLoading(true);
  try {
    const response = await axios.post('http://localhost:4000/api/chat', { prompt });
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0].generated_text || '🤖 Sorry, I could not generate a response.';
    }
    return '🤖 Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error fetching AI response:', error.response || error.message || error);
    return '🤖 Error: Unable to get response from AI server.';
  } finally {
    setLoading(false);
  }
};


  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    const botResponse = await fetchAIResponse(input);

    const botMsg = { role: 'bot', text: botResponse, typewriter: true };
    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <div className="chatbot-container">
      <svg className="background-grid" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#0ff" strokeWidth="0.2" />
          </pattern>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00fff7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00fff7" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <circle cx="50%" cy="50%" r="300" fill="url(#glow)" />
      </svg>

      <div className="chat-and-model">
        {/* Chat Section */}
        <div className="chat-box">
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.role}`}>
                <div className="icon">{msg.role === 'user' ? <User size={20} /> : <Cpu size={20} />}</div>
                <div className="text">
                  {msg.typewriter ? (
                    <Typewriter
                      words={[msg.text]}
                      cursor
                      cursorStyle="_"
                      typeSpeed={40}
                      deleteSpeed={0}
                      delaySpeed={1000}
                    />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble bot">
                <div className="icon">
                  <Cpu size={20} />
                </div>
                <div className="text">🤖 Thinking...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="chat-input"
          >
            <input
              type="text"
              placeholder="Enter command..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              <Send size={20} />
              Send
            </button>
          </form>
        </div>

        {/* 3D Model Section */}
        <div className="model-container">
          <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Suspense fallback={null}>
              <Stage environment="city" intensity={0.6} shadows={false}>
                <IronManModel />
              </Stage>
            </Suspense>
            <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
