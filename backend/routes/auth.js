const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Verify Firebase token
router.post('/verify-token', async (req, res) => {
  try {
    if (!admin.apps.length) {
      return res.status(503).json({ error: 'Firebase auth is not configured' });
    }

    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    res.json({ uid: decodedToken.uid, email: decodedToken.email });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

module.exports = router;
