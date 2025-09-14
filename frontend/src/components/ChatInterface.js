import React, { useState, useEffect } from 'react';
import { saveChat, getChatHistory } from '../services/api';
import { auth } from '../services/firebase';

function ChatInterface({ userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      getChatHistory(userId).then(chats => {
        setMessages(chats);
      });
    }
  }, [userId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    // Save user message
    if (userId) {
      await saveChat(userId, input, 'user');
    }

    // Simulate response (replace with actual API call)
    setTimeout(() => {
      const botResponse = { 
        text: 'Based on your profile, I recommend focusing on cloud computing and machine learning skills. These are in high demand for your career path.', 
        sender: 'bot', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);

      // Save bot response
      if (userId) {
        saveChat(userId, botResponse.text, 'bot');
      }
    }, 1500);
  };

  return (
    <div className="card h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Career Advisor Chat</h2>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`max-w-[80%] p-4 rounded-2xl ${
              msg.sender === 'user' 
                ? 'bg-primary text-white ml-auto rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}
          >
            {msg.text}
          </div>
        ))}
        
        {isLoading && (
          <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl rounded-bl-none max-w-[80%]">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask about your career path..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="input-field flex-1"
          disabled={isLoading}
        />
        <button 
          onClick={sendMessage} 
          className="btn-primary"
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;
