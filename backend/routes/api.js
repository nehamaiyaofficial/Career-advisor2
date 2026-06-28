const express = require('express');
const router = express.Router();
const pdfParse = require('pdf-parse');
const multer = require('multer');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const googleTrends = require('google-trends-api');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const parseJsonFromModel = (text) => {
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  return JSON.parse(cleaned);
};

const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-pro" });
};

const knownSkills = [
  'JavaScript',
  'TypeScript',
  'React',
  'React Native',
  'Node.js',
  'Express',
  'Python',
  'Java',
  'SQL',
  'MongoDB',
  'Firebase',
  'AWS',
  'Docker',
  'Kubernetes',
  'Machine Learning',
  'Data Science',
  'Git',
  'HTML',
  'CSS',
  'Tailwind CSS',
  'REST APIs',
  'GraphQL',
  'Communication',
  'Leadership',
  'Problem Solving',
  'Project Management'
];

const fallbackSkillsFromText = (text) => {
  const normalizedText = text.toLowerCase();
  const matchedSkills = knownSkills.filter((skill) => normalizedText.includes(skill.toLowerCase()));

  if (matchedSkills.length > 0) {
    return matchedSkills;
  }

  return text
    .split(/[\n,;|]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
};

const fallbackSuggestions = (skills, careerGoal) => {
  const normalizedSkills = skills.map((skill) => String(skill).toLowerCase());
  const targetSkills = ['React Native', 'TypeScript', 'REST APIs', 'Firebase', 'Git', 'Problem Solving'];
  const missingSkills = targetSkills.filter((skill) => !normalizedSkills.includes(skill.toLowerCase()));

  return {
    missingSkills,
    recommendedCourses: [
      { name: `Build toward ${careerGoal} with React Native`, platform: 'Expo Docs' },
      { name: 'TypeScript for JavaScript Developers', platform: 'Microsoft Learn' },
      { name: 'APIs and Backend Integration', platform: 'freeCodeCamp' }
    ],
    careerRoadmap: [
      'Polish your current skill list and portfolio projects',
      `Build one practical ${careerGoal} project that uses APIs and authentication`,
      'Add testing, documentation, and deployment experience',
      'Apply to roles with a resume tailored to the missing skills above'
    ]
  };
};

const fallbackTrends = [
  { skill: 'React Native', demand: 88 },
  { skill: 'TypeScript', demand: 84 },
  { skill: 'Cloud Fundamentals', demand: 79 },
  { skill: 'AI Tooling', demand: 76 },
  { skill: 'Firebase', demand: 70 }
];

// Export a function that accepts db instance
module.exports = (db) => {
  // Parse CV and extract skills
  router.post('/parse-cv', async (req, res) => {
    try {
      const { cvText } = req.body;
      if (!cvText || typeof cvText !== 'string') {
        return res.status(400).json({ error: 'cvText is required' });
      }
      
      // Use Gemini to extract skills
      const model = getGeminiModel();
      const prompt = `Extract the professional skills from this CV text. Return only a JSON array of skills: ${cvText}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const skillsText = response.text();
      
      // Parse the skills (assuming Gemini returns a JSON array)
      const skills = parseJsonFromModel(skillsText);
      
      res.json({ skills });
    } catch (error) {
      console.error('Error parsing CV:', error);
      return res.json({ skills: fallbackSkillsFromText(req.body.cvText || '') });
    }
  });

  router.post('/parse-cv-file', upload.single('cv'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'PDF file is required' });
      }

      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Only PDF files are supported' });
      }

      const parsedPdf = await pdfParse(req.file.buffer);
      const model = getGeminiModel();
      const prompt = `Extract the professional skills from this CV text. Return only a JSON array of skills: ${parsedPdf.text}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const skills = parseJsonFromModel(response.text());

      res.json({ skills });
    } catch (error) {
      console.error('Error parsing CV file:', error);
      if (req.file) {
        try {
          const parsedPdf = await pdfParse(req.file.buffer);
          return res.json({ skills: fallbackSkillsFromText(parsedPdf.text) });
        } catch (pdfError) {
          console.error('Fallback PDF parsing failed:', pdfError);
        }
      }

      res.status(500).json({ error: 'Failed to parse CV file' });
    }
  });

  // Get personalized suggestions
  router.post('/suggestions', async (req, res) => {
    try {
      const { skills, careerGoal } = req.body;
      
      if (!Array.isArray(skills) || !careerGoal) {
        return res.status(400).json({ error: 'skills and careerGoal are required' });
      }

      const model = getGeminiModel();
      const prompt = `Given the skills: ${skills.join(', ')} and career goal: ${careerGoal}, provide:
        1. Missing skills (as a JSON array)
        2. Recommended courses (as a JSON array of objects with course name and platform)
        3. A career roadmap (as a JSON array of steps)
      Return as a JSON object with keys: missingSkills, recommendedCourses, careerRoadmap`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestionsText = response.text();
      
      const suggestions = parseJsonFromModel(suggestionsText);
      
      res.json(suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return res.json(fallbackSuggestions(req.body.skills || [], req.body.careerGoal || 'your target role'));
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
      res.json({ trends: fallbackTrends });
    }
  });

  // Save chat history (bonus)
  router.post('/save-chat', async (req, res) => {
    try {
      const { userId, message, sender } = req.body;
      if (!db) {
        return res.json({ success: true, persisted: false });
      }

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
      if (!db) {
        return res.json([]);
      }

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
