const express = require('express');
const router = express.Router({ mergeParams: true }); // To access parent route params
const admin = require('../config/firebase');
const db = admin.firestore();

// Get all versions for a novel
router.get('/', async (req, res) => {
  try {
    const { novelId } = req.params;
    const snapshot = await db.collection('novels').doc(novelId)
      .collection('versions').orderBy('createdAt', 'desc').get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    
    const versions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(versions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({ error: 'Failed to fetch versions', details: error.message });
  }
});

// Get a specific version
router.get('/:versionId', async (req, res) => {
  try {
    const { novelId, versionId } = req.params;
    const versionDoc = await db.collection('novels').doc(novelId)
      .collection('versions').doc(versionId).get();
    
    if (!versionDoc.exists) {
      return res.status(404).json({ error: 'Version not found' });
    }
    
    res.status(200).json({ id: versionDoc.id, ...versionDoc.data() });
  } catch (error) {
    console.error(`Error fetching version ${req.params.versionId}:`, error);
    res.status(500).json({ error: 'Failed to fetch version', details: error.message });
  }
});

// Create a new version
router.post('/', async (req, res) => {
  try {
    const { novelId } = req.params;
    const { content, description } = req.body;
    
    const versionData = {
      content,
      description,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('novels').doc(novelId)
      .collection('versions').add(versionData);
    const newVersion = await docRef.get();
    
    res.status(201).json({ id: docRef.id, ...newVersion.data() });
  } catch (error) {
    console.error('Error creating version:', error);
    res.status(500).json({ error: 'Failed to create version', details: error.message });
  }
});

module.exports = router; 