import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import CVUpload from './components/CVUpload';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { getSuggestions, getTrendingSkills } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [trendingSkills, setTrendingSkills] = useState(null);

  const handleLogin = (user) => {
    setUser(user);
  };

  const handleSkillsExtracted = async (extractedSkills) => {
    setSkills(extractedSkills);
    // Get suggestions
    const careerGoal = "Software Engineer"; // You can make this dynamic
    const suggestionsData = await getSuggestions(extractedSkills, careerGoal);
    setSuggestions(suggestionsData);
    // Get trending skills
    const trends = await getTrendingSkills();
    setTrendingSkills(trends);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Career Advisor</h1>
            <p className="text-gray-600">Personalized career guidance and skill development</p>
          </div>
          
          {user ? (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium mr-2">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700">{user.email}</span>
            </div>
          ) : (
            <button 
              onClick={() => document.getElementById('login-modal').classList.remove('hidden')}
              className="btn-secondary"
            >
              Sign In
            </button>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CVUpload onSkillsExtracted={handleSkillsExtracted} />
            
            {skills.length > 0 && suggestions && (
              <Dashboard 
                skills={skills} 
                suggestions={suggestions} 
                trendingSkills={trendingSkills} 
              />
            )}
          </div>
          
          <div>
            <ChatInterface userId={user ? user.uid : null} />
          </div>
        </div>
      </main>
      
      {/* Login Modal */}
      <div id="login-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="relative">
          <button 
            onClick={() => document.getElementById('login-modal').classList.add('hidden')}
            className="absolute -top-4 -right-4 bg-white rounded-full p-1 shadow-md"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <Login onLogin={(user) => {
            handleLogin(user);
            document.getElementById('login-modal').classList.add('hidden');
          }} />
        </div>
      </div>
    </div>
  );
}

export default App;
