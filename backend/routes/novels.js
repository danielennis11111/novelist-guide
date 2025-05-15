const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const db = admin.firestore();

// Get all novels
router.get('/', async (req, res) => {
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

// Get a single novel by ID
router.get('/:id', async (req, res) => {
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

// Create a new novel
router.post('/', async (req, res) => {
  try {
    const { title, description, genre, targetAudience, status } = req.body;
    const novelData = {
      title,
      description,
      genre,
      targetAudience,
      status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('novels').add(novelData);
    const newNovel = await docRef.get();
    
    res.status(201).json({ id: docRef.id, ...newNovel.data() });
  } catch (error) {
    console.error('Error creating novel:', error);
    res.status(500).json({ error: 'Failed to create novel', details: error.message });
  }
});

// Update a novel
router.put('/:id', async (req, res) => {
  try {
    const novelId = req.params.id;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const novelRef = db.collection('novels').doc(novelId);
    const novel = await novelRef.get();
    
    if (!novel.exists) {
      return res.status(404).json({ error: 'Novel not found' });
    }
    
    await novelRef.update(updateData);
    const updatedNovel = await novelRef.get();
    
    res.status(200).json({ id: novelId, ...updatedNovel.data() });
  } catch (error) {
    console.error(`Error updating novel ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update novel', details: error.message });
  }
});

// Delete a novel
router.delete('/:id', async (req, res) => {
  try {
    const novelId = req.params.id;
    const novelRef = db.collection('novels').doc(novelId);
    const novel = await novelRef.get();
    
    if (!novel.exists) {
      return res.status(404).json({ error: 'Novel not found' });
    }
    
    await novelRef.delete();
    res.status(200).json({ message: 'Novel deleted successfully', id: novelId });
  } catch (error) {
    console.error(`Error deleting novel ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete novel', details: error.message });
  }
});

module.exports = router; 