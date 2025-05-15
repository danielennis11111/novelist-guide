const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const db = admin.firestore();

// Import route modules
const novelsRouter = require('./novels');
const versionsRouter = require('./versions');
const worldBibleRouter = require('./world-bible');
const remindersRouter = require('./reminders');
const questsRouter = require('./quests');

// Mount routes
router.use('/novels', novelsRouter);

// Routes that require a novel ID
router.use('/novels/:novelId/versions', versionsRouter);
router.use('/novels/:novelId/world-bible', worldBibleRouter);
router.use('/novels/:novelId/reminders', remindersRouter);
router.use('/novels/:novelId/quests', questsRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Example route
router.get('/hello', (req, res) => {
  res.status(200).json({ message: 'Hello from the backend API!' });
});

// TODO: Migrate your API routes from src/pages/api here

// Example: Get all novels
router.get('/novels', async (req, res) => {
  try {
    const snapshot = await db.collection('novels').get();
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    const novels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(novels);
  } catch (error) {
    console.error('Error fetching novels:', error);
    res.status(500).json({ error: 'Failed to fetch novels', details: error.message });
  }
});

// Example: Get a single novel by ID
router.get('/novels/:id', async (req, res) => {
  try {
    const novelId = req.params.id;
    const novelDoc = await db.collection('novels').doc(novelId).get();
    if (!novelDoc.exists) {
      return res.status(404).json({ error: 'Novel not found' });
    }
    res.status(200).json({ id: novelDoc.id, ...novelDoc.data() });
  } catch (error) {
    console.error(`Error fetching novel ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch novel', details: error.message });
  }
});

// TODO: Add routes for POST, PUT, DELETE for novels
// router.post('/novels', async (req, res) => { ... });
// router.put('/novels/:id', async (req, res) => { ... });
// router.delete('/novels/:id', async (req, res) => { ... });

// TODO: Add other API groups (versions, world-bible, reminders, quests)

module.exports = router; 