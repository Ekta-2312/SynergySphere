const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const jwtAuth = require('../middleware/jwtAuth');

// Get discussions for a specific project
router.get('/project/:projectId', jwtAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has access to this project
    const hasAccess =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const discussions = await Discussion.find({ project: req.params.projectId })
      .populate('author', 'name email')
      .populate('replies.author', 'name email')
      .sort({ createdAt: -1 });

    res.json(discussions);
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ error: 'Failed to fetch discussions' });
  }
});

// Get a single discussion
router.get('/:id', jwtAuth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('project', 'title members owner')
      .populate('author', 'name email')
      .populate('replies.author', 'name email');

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    // Check if user has access to this discussion's project
    const project = discussion.project;
    const hasAccess =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(discussion);
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ error: 'Failed to fetch discussion' });
  }
});

// Create a new discussion
router.post('/', jwtAuth, async (req, res) => {
  try {
    const { title, content, project: projectId, tags } = req.body;

    if (!title || !content || !projectId) {
      return res.status(400).json({ error: 'Title, content, and project are required' });
    }

    // Check if project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const hasAccess =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    const discussion = new Discussion({
      title,
      content,
      project: projectId,
      author: req.user._id,
      tags: tags || []
    });

    await discussion.save();
    await discussion.populate('author', 'name email');

    // Create notifications for project members
    const members = project.members.filter(member => member.toString() !== req.user._id.toString());
    if (project.owner.toString() !== req.user._id.toString()) {
      members.push(project.owner);
    }

    for (const memberId of members) {
      try {
        await Notification.create({
          recipient: memberId,
          type: 'new_discussion',
          title: 'New Discussion',
          message: `New discussion started: ${title}`,
          relatedProject: projectId,
          relatedDiscussion: discussion._id
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }

    res.status(201).json(discussion);
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ error: 'Failed to create discussion' });
  }
});

// Update a discussion
router.put('/:id', jwtAuth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id).populate(
      'project',
      'owner members'
    );

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    // Check if user is the creator or has access to the project
    const project = discussion.project;
    const canEdit =
      discussion.creator.toString() === req.user._id.toString() ||
      project.owner.toString() === req.user._id.toString();

    if (!canEdit) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, content, tags } = req.body;

    if (title !== undefined) {
      discussion.title = title;
    }
    if (content !== undefined) {
      discussion.content = content;
    }
    if (tags !== undefined) {
      discussion.tags = tags;
    }

    await discussion.save();
    await discussion.populate('creator', 'name email');

    // Send notifications for discussion updates
    try {
      const notificationPromises = [];

      // Notify project members about discussion update
      const members = project.members.filter(
        member => member.toString() !== req.user._id.toString()
      );
      if (project.owner.toString() !== req.user._id.toString()) {
        members.push(project.owner);
      }

      members.forEach(memberId => {
        notificationPromises.push(
          Notification.create({
            recipient: memberId,
            type: 'discussion_updated',
            title: 'Discussion Updated',
            message: `${req.user.name} updated the discussion "${discussion.title}"`,
            relatedProject: project._id,
            relatedDiscussion: discussion._id,
            sender: req.user._id
          })
        );
      });

      await Promise.all(notificationPromises);
    } catch (notifError) {
      console.error('Error creating discussion update notifications:', notifError);
    }

    res.json(discussion);
  } catch (error) {
    console.error('Error updating discussion:', error);
    res.status(500).json({ error: 'Failed to update discussion' });
  }
});

// Delete a discussion
router.delete('/:id', jwtAuth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id).populate('project', 'owner');

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    // Check if user is the creator or project owner
    const canDelete =
      discussion.creator.toString() === req.user._id.toString() ||
      discussion.project.owner.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Populate project members for notifications
    await discussion.populate('project.members');

    // Send notifications before deletion
    try {
      const notificationPromises = [];
      const project = discussion.project;

      // Notify project members about discussion deletion
      const members = project.members.filter(
        member => member.toString() !== req.user._id.toString()
      );
      if (project.owner.toString() !== req.user._id.toString()) {
        members.push(project.owner);
      }

      members.forEach(memberId => {
        notificationPromises.push(
          Notification.create({
            recipient: memberId,
            type: 'discussion_deleted',
            title: 'Discussion Deleted',
            message: `${req.user.name} deleted the discussion "${discussion.title}"`,
            relatedProject: project._id,
            sender: req.user._id
          })
        );
      });

      await Promise.all(notificationPromises);
    } catch (notifError) {
      console.error('Error creating discussion deletion notifications:', notifError);
    }

    await Discussion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({ error: 'Failed to delete discussion' });
  }
});

// Add a reply to a discussion
router.post('/:id/replies', jwtAuth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const discussion = await Discussion.findById(req.params.id).populate(
      'project',
      'owner members'
    );

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    // Check if user has access to this discussion's project
    const project = discussion.project;
    const hasAccess =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const reply = {
      content,
      author: req.user._id,
      createdAt: new Date()
    };

    discussion.replies.push(reply);
    await discussion.save();
    await discussion.populate('replies.author', 'name email');

    // Create notifications for discussion participants
    try {
      const notificationPromises = [];
      const notifiedUsers = new Set();

      // Notify discussion creator if different from reply author
      if (discussion.creator.toString() !== req.user._id.toString()) {
        notificationPromises.push(
          Notification.create({
            recipient: discussion.creator,
            type: 'discussion_reply',
            title: 'New Reply',
            message: `${req.user.name} replied to your discussion "${discussion.title}"`,
            relatedProject: project._id,
            relatedDiscussion: discussion._id,
            sender: req.user._id
          })
        );
        notifiedUsers.add(discussion.creator.toString());
      }

      // Notify other reply authors (participants in the discussion)
      discussion.replies.forEach(existingReply => {
        const authorId = existingReply.author.toString();
        if (authorId !== req.user._id.toString() && !notifiedUsers.has(authorId)) {
          notificationPromises.push(
            Notification.create({
              recipient: authorId,
              type: 'discussion_reply',
              title: 'New Reply',
              message: `${req.user.name} replied to the discussion "${discussion.title}"`,
              relatedProject: project._id,
              relatedDiscussion: discussion._id,
              sender: req.user._id
            })
          );
          notifiedUsers.add(authorId);
        }
      });

      await Promise.all(notificationPromises);
    } catch (notifError) {
      console.error('Error creating reply notifications:', notifError);
    }

    res.status(201).json(discussion);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Update a reply
router.put('/:id/replies/:replyId', jwtAuth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const reply = discussion.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    // Check if user is the author of the reply
    if (reply.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    reply.content = content;
    reply.updatedAt = new Date();

    await discussion.save();
    await discussion.populate('replies.author', 'name email');

    res.json(discussion);
  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({ error: 'Failed to update reply' });
  }
});

// Delete a reply
router.delete('/:id/replies/:replyId', jwtAuth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id).populate('project', 'owner');

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const reply = discussion.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    // Check if user is the author of the reply or project owner
    const canDelete =
      reply.author.toString() === req.user._id.toString() ||
      discussion.project.owner.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({ error: 'Access denied' });
    }

    discussion.replies.pull(req.params.replyId);
    await discussion.save();

    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});

// Like/Unlike a discussion
router.post('/:id/like', jwtAuth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id).populate(
      'project',
      'owner members'
    );

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    // Check if user has access to this discussion's project
    const project = discussion.project;
    const hasAccess =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userLiked = discussion.likes.includes(req.user._id);

    if (userLiked) {
      // Unlike
      discussion.likes.pull(req.user._id);
    } else {
      // Like
      discussion.likes.push(req.user._id);
    }

    await discussion.save();

    res.json({
      liked: !userLiked,
      likesCount: discussion.likes.length
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

module.exports = router;
