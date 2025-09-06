const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const jwtAuth = require('../middleware/jwtAuth');

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
      .populate('members', 'name email');

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
router.post('/', jwtAuth, async (req, res) => {
  try {
    const { title, description, dueDate, color } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const project = new Project({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id],
      dueDate: dueDate ? new Date(dueDate) : null,
      color: color || '#4A00E0'
    });

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

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

    const { title, description, status, dueDate, color } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (status) project.status = status;
    if (dueDate) project.dueDate = new Date(dueDate);
    if (color) project.color = color;

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.json(project);
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
