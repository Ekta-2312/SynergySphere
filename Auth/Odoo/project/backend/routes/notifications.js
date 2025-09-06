const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const jwtAuth = require('../middleware/jwtAuth');

// Get notifications for the authenticated user
router.get('/', jwtAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('relatedProject', 'title')
      .populate('relatedTask', 'title')
      .populate('relatedDiscussion', 'title')
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/unread-count', jwtAuth, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', jwtAuth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Check if notification belongs to the authenticated user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', jwtAuth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete a notification
router.delete('/:id', jwtAuth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Check if notification belongs to the authenticated user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Delete all read notifications
router.delete('/read/all', jwtAuth, async (req, res) => {
  try {
    await Notification.deleteMany({
      recipient: req.user._id,
      isRead: true
    });

    res.json({ message: 'All read notifications deleted successfully' });
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    res.status(500).json({ error: 'Failed to delete read notifications' });
  }
});

// Create a new notification (internal use)
router.post('/', jwtAuth, async (req, res) => {
  try {
    const { recipient, type, title, message, relatedProject, relatedTask, relatedDiscussion } = req.body;

    if (!recipient || !type || !title || !message) {
      return res.status(400).json({ error: 'Recipient, type, title, and message are required' });
    }

    const notification = new Notification({
      recipient,
      type,
      title,
      message,
      relatedProject,
      relatedTask,
      relatedDiscussion
    });

    await notification.save();
    await notification.populate('relatedProject', 'title');
    await notification.populate('relatedTask', 'title');
    await notification.populate('relatedDiscussion', 'title');

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Get notifications by type
router.get('/type/:type', jwtAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = [
      'task_assigned', 
      'task_completed', 
      'task_due_soon', 
      'task_status_changed',
      'task_priority_changed',
      'task_unassigned',
      'task_deleted',
      'project_invitation', 
      'project_created',
      'project_updated',
      'project_deleted',
      'discussion_reply', 
      'new_discussion',
      'discussion_updated',
      'discussion_deleted',
      'project_update',
      'deadline_reminder'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    const notifications = await Notification.find({
      recipient: req.user._id,
      type: type
    }).populate('relatedProject', 'title')
      .populate('relatedTask', 'title')
      .populate('relatedDiscussion', 'title')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications by type:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;
