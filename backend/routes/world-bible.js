const express = require('express');
const router = express.Router({ mergeParams: true }); // To access parent route params
const admin = require('../config/firebase');
const db = admin.firestore();

// Get all world bible elements for a novel
router.get('/', async (req, res) => {
  try {
    const { novelId } = req.params;
    const snapshot = await db.collection('novels').doc(novelId)
      .collection('worldElements').get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    
    const elements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(elements);
  } catch (error) {
    console.error('Error fetching world elements:', error);
    res.status(500).json({ error: 'Failed to fetch world elements', details: error.message });
  }
});

// Create a new world bible element
router.post('/', async (req, res) => {
  try {
    const { novelId } = req.params;
    const { name, type, description, relationships } = req.body;
    
    const elementData = {
      name,
      type, // character, location, item, concept
      description,
      relationships: relationships || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('novels').doc(novelId)
      .collection('worldElements').add(elementData);
    const newElement = await docRef.get();
    
    res.status(201).json({ id: docRef.id, ...newElement.data() });
  } catch (error) {
    console.error('Error creating world element:', error);
    res.status(500).json({ error: 'Failed to create world element', details: error.message });
  }
});

// Update a world bible element
router.put('/:elementId', async (req, res) => {
  try {
    const { novelId, elementId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const elementRef = db.collection('novels').doc(novelId)
      .collection('worldElements').doc(elementId);
    const element = await elementRef.get();
    
    if (!element.exists) {
      return res.status(404).json({ error: 'World element not found' });
    }
    
    await elementRef.update(updateData);
    const updatedElement = await elementRef.get();
    
    res.status(200).json({ id: elementId, ...updatedElement.data() });
  } catch (error) {
    console.error(`Error updating world element ${req.params.elementId}:`, error);
    res.status(500).json({ error: 'Failed to update world element', details: error.message });
  }
});

// Delete a world bible element
router.delete('/:elementId', async (req, res) => {
  try {
    const { novelId, elementId } = req.params;
    const elementRef = db.collection('novels').doc(novelId)
      .collection('worldElements').doc(elementId);
    const element = await elementRef.get();
    
    if (!element.exists) {
      return res.status(404).json({ error: 'World element not found' });
    }
    
    await elementRef.delete();
    res.status(200).json({ message: 'World element deleted successfully', id: elementId });
  } catch (error) {
    console.error(`Error deleting world element ${req.params.elementId}:`, error);
    res.status(500).json({ error: 'Failed to delete world element', details: error.message });
  }
});

module.exports = router; 