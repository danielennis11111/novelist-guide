const express = require('express');
const router = express.Router({ mergeParams: true }); // To access parent route params
const admin = require('../config/firebase');
const db = admin.firestore();

// Get all reminders for a novel
router.get('/', async (req, res) => {
  try {
    const { novelId } = req.params;
    const snapshot = await db.collection('novels').doc(novelId)
      .collection('reminders')
      .orderBy('scheduledFor', 'asc')
      .get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    
    const reminders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders', details: error.message });
  }
});

// Create a new reminder
router.post('/', async (req, res) => {
  try {
    const { novelId } = req.params;
    const { title, description, scheduledFor, isRecurring, recurringPattern } = req.body;
    
    const reminderData = {
      title,
      description,
      scheduledFor: admin.firestore.Timestamp.fromDate(new Date(scheduledFor)),
      isRecurring: isRecurring || false,
      recurringPattern,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('novels').doc(novelId)
      .collection('reminders').add(reminderData);
    const newReminder = await docRef.get();
    
    res.status(201).json({ id: docRef.id, ...newReminder.data() });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Failed to create reminder', details: error.message });
  }
});

// Update a reminder
router.put('/:reminderId', async (req, res) => {
  try {
    const { novelId, reminderId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // If scheduledFor is provided, convert it to Firestore Timestamp
    if (updateData.scheduledFor) {
      updateData.scheduledFor = admin.firestore.Timestamp.fromDate(
        new Date(updateData.scheduledFor)
      );
    }
    
    const reminderRef = db.collection('novels').doc(novelId)
      .collection('reminders').doc(reminderId);
    const reminder = await reminderRef.get();
    
    if (!reminder.exists) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    await reminderRef.update(updateData);
    const updatedReminder = await reminderRef.get();
    
    res.status(200).json({ id: reminderId, ...updatedReminder.data() });
  } catch (error) {
    console.error(`Error updating reminder ${req.params.reminderId}:`, error);
    res.status(500).json({ error: 'Failed to update reminder', details: error.message });
  }
});

// Delete a reminder
router.delete('/:reminderId', async (req, res) => {
  try {
    const { novelId, reminderId } = req.params;
    const reminderRef = db.collection('novels').doc(novelId)
      .collection('reminders').doc(reminderId);
    const reminder = await reminderRef.get();
    
    if (!reminder.exists) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    await reminderRef.delete();
    res.status(200).json({ message: 'Reminder deleted successfully', id: reminderId });
  } catch (error) {
    console.error(`Error deleting reminder ${req.params.reminderId}:`, error);
    res.status(500).json({ error: 'Failed to delete reminder', details: error.message });
  }
});

module.exports = router; 