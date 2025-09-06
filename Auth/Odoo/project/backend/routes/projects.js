const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const jwtAuth = require('../middleware/jwtAuth');
const upload = require('../middleware/upload');

// Get all projects for the authenticated user
router.get('/', jwtAuth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    }).populate('owner', 'name email')
      .populate('members', 'name email')
      .populate('projectManager', 'name email')
      .sort({ updatedAt: -1 });

    // Get task stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'done').length;
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...project.toObject(),
          taskStats: {
            total: totalTasks,
            completed: completedTasks,
            completionPercentage
          }
        };
      })
    );

    res.json(projectsWithStats);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get a specific project
router.get('/:id', jwtAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate('projectManager', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has access to this project
    const hasAccess = project.owner._id.toString() === req.user._id.toString() ||
      project.members.some(member => member._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get task stats
    const tasks = await Task.find({ project: project._id });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const projectWithStats = {
      ...project.toObject(),
      taskStats: {
        total: totalTasks,
        completed: completedTasks,
        completionPercentage
      }
    };

    res.json(projectWithStats);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create a new project
router.post('/', jwtAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, dueDate, color, priority, tags, projectManager } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Parse tags if they come as a JSON string
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = typeof tags === 'string' ? [tags] : tags;
      }
    }

    const projectData = {
      title,
      description,
      owner: req.user._id,
      members: [req.user._id],
      dueDate: dueDate ? new Date(dueDate) : null,
      color: color || '#4A00E0',
      priority: priority || 'medium',
      tags: parsedTags
    };

    // Add project manager if specified
    if (projectManager && projectManager !== req.user._id.toString()) {
      projectData.projectManager = projectManager;
      // Add project manager to members if not already included
      if (!projectData.members.includes(projectManager)) {
        projectData.members.push(projectManager);
      }
    }

    // Add image path if uploaded
    if (req.file) {
      projectData.image = `/uploads/projects/${req.file.filename}`;
    }

    const project = new Project(projectData);

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');
    await project.populate('projectManager', 'name email');

    // Create notification for the project creator
    try {
      await Notification.create({
        recipient: req.user._id,
        sender: req.user._id,
        type: 'project_created',
        title: 'Project Created',
        message: `You have successfully created the project "${title}"`,
        relatedProject: project._id
      });
    } catch (notifError) {
      console.error('Error creating project notification:', notifError);
    }

    res.status(201).json({
      ...project.toObject(),
      taskStats: {
        total: 0,
        completed: 0,
        completionPercentage: 0
      }
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update a project
router.put('/:id', jwtAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only project owner can update project' });
    }

    const { title, description, status, dueDate, color, priority, tags, projectManager } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (status) project.status = status;
    if (dueDate) project.dueDate = new Date(dueDate);
    if (color) project.color = color;
    if (priority) project.priority = priority;
    if (tags !== undefined) project.tags = tags;
    if (projectManager !== undefined) project.projectManager = projectManager;

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');
    await project.populate('projectManager', 'name email');

    // Send notifications to all project members about the update
    try {
      const notificationPromises = project.members.map(member => {
        if (member._id.toString() !== req.user._id.toString()) {
          return Notification.create({
            recipient: member._id,
            type: 'project_updated',
            title: 'Project Updated',
            message: `${req.user.name} updated the project "${project.title}"`,
            relatedProject: project._id,
            sender: req.user._id
          });
        }
      }).filter(Boolean);

      await Promise.all(notificationPromises);
    } catch (notifError) {
      console.error('Error creating project update notifications:', notifError);
    }

    // Get task stats for the updated project
    const tasks = await Task.find({ project: project._id });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const projectWithStats = {
      ...project.toObject(),
      taskStats: {
        total: totalTasks,
        completed: completedTasks,
        completionPercentage
      }
    };

    res.json(projectWithStats);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete a project
router.delete('/:id', jwtAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only project owner can delete project' });
    }

    // Populate members to send notifications before deletion
    await project.populate('members', 'name email');

    // Send notifications to all project members about deletion
    try {
      const notificationPromises = project.members.map(member => {
        if (member._id.toString() !== req.user._id.toString()) {
          return Notification.create({
            recipient: member._id,
            type: 'project_deleted',
            title: 'Project Deleted',
            message: `The project "${project.title}" has been deleted by ${req.user.name}`,
            sender: req.user._id
          });
        }
      }).filter(Boolean);

      await Promise.all(notificationPromises);
    } catch (notifError) {
      console.error('Error creating project deletion notifications:', notifError);
    }

    // Delete all related tasks and discussions
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Add member to project
router.post('/:id/members', jwtAuth, async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only project owner can add members' });
    }

    // Find user by email
    const Register = require('../models/Register');
    const user = await Register.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    if (project.members.includes(user._id)) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    project.members.push(user._id);
    await project.save();

    // Create notification for the new member
    const notification = new Notification({
      recipient: user._id,
      sender: req.user._id,
      type: 'project_invitation',
      title: 'Project Invitation',
      message: `You have been added to the project "${project.title}"`,
      relatedProject: project._id
    });
    await notification.save();

    await project.populate('members', 'name email');
    res.json(project.members);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Remove member from project
router.delete('/:id/members/:memberId', jwtAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only project owner can remove members' });
    }

    project.members = project.members.filter(
      member => member.toString() !== req.params.memberId
    );

    await project.save();
    await project.populate('members', 'name email');
    res.json(project.members);
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

module.exports = router;
