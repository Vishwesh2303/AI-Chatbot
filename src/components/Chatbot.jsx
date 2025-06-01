import React, { useState, useRef, useEffect, Suspense } from 'react';
import axios from 'axios';
import { Typewriter } from 'react-simple-typewriter';
import { Send, User, Cpu, Mic } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, useAnimations } from '@react-three/drei';
import './Chatbot.css';

// Iron Man Model with Animation
const IronManModel = () => {
  const group = useRef();
  const { scene, animations } = useGLTF(`${process.env.PUBLIC_URL}/models/iron_man.glb`);
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    actions['Idle']?.play();
  }, [actions]);

  useFrame(({ mouse }) => {
    if (group.current) {
      group.current.rotation.y = mouse.x * Math.PI * 0.5;
    }
  });

  return <primitive ref={group} object={scene} scale={1.2} position={[0, -1.5, 0]} />;
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

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices().find((v) => v.lang === 'en-US');
    speechSynthesis.speak(utterance);
  };

  const fetchAIResponse = async (prompt) => {
  setLoading(true);
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
      {
        inputs: prompt,
      },
      {
        headers: {
          Authorization: `Bearer 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`,
        },
      }
    );
    // HuggingFace returns different response format, e.g.
    // response.data could be [{ generated_text: "some text" }]
    return response.data[0]?.generated_text || '🤖 No response from model.';
  } catch (error) {
    if (error.response) {
      console.error('HF API error response:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up HF request:', error.message);
    }
    return '🤖 Error: Unable to get response.';
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
    speak(botResponse);
    const botMsg = { role: 'bot', text: botResponse, typewriter: true };
    setMessages((prev) => [...prev, botMsg]);
  };

  const handleVoiceInput = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
      handleSend();
    };
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
            <button type="button" onClick={handleVoiceInput}><Mic size={20} /></button>
            <button type="submit" disabled={loading}><Send size={20} /> Send</button>
          </form>
        </div>

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
