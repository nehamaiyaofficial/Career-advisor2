const express = require('express');
const router = express.Router();
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const googleTrends = require('google-trends-api');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Export a function that accepts db instance
module.exports = (db) => {
  // Parse CV and extract skills
  router.post('/parse-cv', async (req, res) => {
    try {
      const { cvText } = req.body;
      
      // Use Gemini to extract skills
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Extract the professional skills from this CV text. Return only a JSON array of skills: ${cvText}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const skillsText = response.text();
      
      // Parse the skills (assuming Gemini returns a JSON array)
      const skills = JSON.parse(skillsText);
      
      res.json({ skills });
    } catch (error) {
      console.error('Error parsing CV:', error);
      res.status(500).json({ error: 'Failed to parse CV' });
    }
  });

  // Get personalized suggestions
  router.post('/suggestions', async (req, res) => {
    try {
      const { skills, careerGoal } = req.body;
      
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Given the skills: ${skills.join(', ')} and career goal: ${careerGoal}, provide:
        1. Missing skills (as a JSON array)
        2. Recommended courses (as a JSON array of objects with course name and platform)
        3. A career roadmap (as a JSON array of steps)
      Return as a JSON object with keys: missingSkills, recommendedCourses, careerRoadmap`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestionsText = response.text();
      
      const suggestions = JSON.parse(suggestionsText);
      
      res.json(suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      res.status(500).json({ error: 'Failed to get suggestions' });
    }
  });

  // Get trending skills
  router.get('/trending-skills', async (req, res) => {
    try {
      const results = await googleTrends.interestOverTime({
        keyword: ['programming', 'data science', 'machine learning', 'web development'],
        geo: 'US',
        hl: 'en'
      });
      
      res.json({ trends: results });
    } catch (error) {
      console.error('Error getting trends:', error);
      res.status(500).json({ error: 'Failed to get trends' });
    }
  });

  // Save chat history (bonus)
  router.post('/save-chat', async (req, res) => {
    try {
      const { userId, message, sender } = req.body;
      await db.collection('chats').add({
        userId,
        message,
        sender,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving chat:', error);
      res.status(500).json({ error: 'Failed to save chat' });
    }
  });

  // Get chat history (bonus)
  router.get('/chat-history/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const snapshot = await db.collection('chats')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'asc')
        .get();
      
      const chats = [];
      snapshot.forEach(doc => {
        chats.push(doc.data());
      });
      
      res.json(chats);
    } catch (error) {
      console.error('Error getting chat history:', error);
      res.status(500).json({ error: 'Failed to get chat history' });
    }
  });

  return router;
};
