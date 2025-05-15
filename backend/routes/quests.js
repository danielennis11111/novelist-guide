const express = require('express');
const router = express.Router({ mergeParams: true }); // To access parent route params
const admin = require('../config/firebase');
const db = admin.firestore();

// Get all quests for a novel
router.get('/', async (req, res) => {
  try {
    const { novelId } = req.params;
    const snapshot = await db.collection('novels').doc(novelId)
      .collection('quests')
      .orderBy('createdAt', 'desc')
      .get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    
    const quests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(quests);
  } catch (error) {
    console.error('Error fetching quests:', error);
    res.status(500).json({ error: 'Failed to fetch quests', details: error.message });
  }
});

// Create a new quest
router.post('/', async (req, res) => {
  try {
    const { novelId } = req.params;
    const { title, description, type, goal, reward, deadline } = req.body;
    
    const questData = {
      title,
      description,
      type, // 'daily', 'weekly', 'achievement'
      goal: {
        type: goal.type, // 'wordCount', 'elementCount', 'sessionCount'
        target: goal.target,
        current: 0
      },
      reward: {
        type: reward.type, // 'points', 'badge', 'achievement'
        value: reward.value
      },
      status: 'active',
      progress: 0,
      deadline: deadline ? admin.firestore.Timestamp.fromDate(new Date(deadline)) : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('novels').doc(novelId)
      .collection('quests').add(questData);
    const newQuest = await docRef.get();
    
    res.status(201).json({ id: docRef.id, ...newQuest.data() });
  } catch (error) {
    console.error('Error creating quest:', error);
    res.status(500).json({ error: 'Failed to create quest', details: error.message });
  }
});

// Update a quest (including progress)
router.put('/:questId', async (req, res) => {
  try {
    const { novelId, questId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // If deadline is provided, convert it to Firestore Timestamp
    if (updateData.deadline) {
      updateData.deadline = admin.firestore.Timestamp.fromDate(
        new Date(updateData.deadline)
      );
    }
    
    const questRef = db.collection('novels').doc(novelId)
      .collection('quests').doc(questId);
    const quest = await questRef.get();
    
    if (!quest.exists) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    
    // Check if quest is completed
    if (updateData.goal?.current >= quest.data().goal.target) {
      updateData.status = 'completed';
      updateData.progress = 100;
    } else if (updateData.goal?.current) {
      updateData.progress = Math.round((updateData.goal.current / quest.data().goal.target) * 100);
    }
    
    await questRef.update(updateData);
    const updatedQuest = await questRef.get();
    
    res.status(200).json({ id: questId, ...updatedQuest.data() });
  } catch (error) {
    console.error(`Error updating quest ${req.params.questId}:`, error);
    res.status(500).json({ error: 'Failed to update quest', details: error.message });
  }
});

// Delete a quest
router.delete('/:questId', async (req, res) => {
  try {
    const { novelId, questId } = req.params;
    const questRef = db.collection('novels').doc(novelId)
      .collection('quests').doc(questId);
    const quest = await questRef.get();
    
    if (!quest.exists) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    
    await questRef.delete();
    res.status(200).json({ message: 'Quest deleted successfully', id: questId });
  } catch (error) {
    console.error(`Error deleting quest ${req.params.questId}:`, error);
    res.status(500).json({ error: 'Failed to delete quest', details: error.message });
  }
});

module.exports = router; 