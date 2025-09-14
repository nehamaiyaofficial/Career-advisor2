const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Verify Firebase token
router.post('/verify-token', async (req, res) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    res.json({ uid: decodedToken.uid, email: decodedToken.email });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

module.exports = router;
