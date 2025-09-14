import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Parse CV and extract skills
export const parseCV = async (cvText) => {
  const response = await axios.post(`${API_URL}/parse-cv`, { cvText });
  return response.data.skills;
};

// Get personalized suggestions
export const getSuggestions = async (skills, careerGoal) => {
  const response = await axios.post(`${API_URL}/suggestions`, { skills, careerGoal });
  return response.data;
};

// Get trending skills
export const getTrendingSkills = async () => {
  const response = await axios.get(`${API_URL}/trending-skills`);
  return response.data.trends;
};

// Save chat message (bonus)
export const saveChat = async (userId, message, sender) => {
  await axios.post(`${API_URL}/save-chat`, { userId, message, sender });
};

// Get chat history (bonus)
export const getChatHistory = async (userId) => {
  const response = await axios.get(`${API_URL}/chat-history/${userId}`);
  return response.data;
};
