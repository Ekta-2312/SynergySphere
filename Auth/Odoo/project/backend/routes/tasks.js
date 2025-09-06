const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const jwtAuth = require('../middleware/jwtAuth');

// Get tasks for a specific project
router.get('/project/:projectId', jwtAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has access to this project
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email')
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get tasks assigned to the authenticated user
router.get('/my-tasks', jwtAuth, async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { assignee: req.user._id },
        { creator: req.user._id }
      ]
    }).populate('project', 'title color')
      .populate('assignee', 'name email')
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get a single task
router.get('/:id', jwtAuth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title members owner')
      .populate('assignee', 'name email')
      .populate('creator', 'name email');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user has access to this task's project
    const project = task.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create a new task
router.post('/', jwtAuth, async (req, res) => {
  try {
    const { title, description, project: projectId, assignee, priority, dueDate, tags, estimatedHours } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ error: 'Title and project are required' });
    }

    // Check if project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    const task = new Task({
      title,
      description,
      project: projectId,
      creator: req.user._id,
      assignee: assignee || req.user._id,
      priority: priority || 'medium',
      status: 'todo',
      dueDate,
      tags: tags || [],
      estimatedHours
    });

    await task.save();
    await task.populate('assignee', 'name email');
    await task.populate('creator', 'name email');

    // Create notifications for task creation
    try {
      // Notify assignee if different from creator
      if (assignee && assignee !== req.user._id.toString()) {
        await Notification.create({
          recipient: assignee,
          sender: req.user._id,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You have been assigned to task: ${title}`,
          relatedProject: projectId,
          relatedTask: task._id
        });
      }

      // Notify project owner if different from creator and assignee
      if (project.owner.toString() !== req.user._id.toString() && 
          project.owner.toString() !== assignee) {
        await Notification.create({
          recipient: project.owner,
          sender: req.user._id,
          type: 'task_created',
          title: 'New Task Created',
          message: `A new task "${title}" has been created in project "${project.title}"`,
          relatedProject: projectId,
          relatedTask: task._id
        });
      }

      // Notify creator about successful task creation
      await Notification.create({
        recipient: req.user._id,
        sender: req.user._id,
        type: 'task_created',
        title: 'Task Created Successfully',
        message: `You have successfully created the task "${title}"`,
        relatedProject: projectId,
        relatedTask: task._id
      });

    } catch (notifError) {
      console.error('Error creating task notifications:', notifError);
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task
router.put('/:id', jwtAuth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'owner members');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user has access to this task's project
    const project = task.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, description, status, priority, assignee, dueDate, tags, estimatedHours, actualHours } = req.body;

    // Store original values for notification comparison
    const originalStatus = task.status;
    const originalAssignee = task.assignee?.toString();
    const originalPriority = task.priority;

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) {
      task.status = status;
      if (status === 'done' && !task.completedAt) {
        task.completedAt = new Date();
      } else if (status !== 'done') {
        task.completedAt = undefined;
      }
    }
    if (priority !== undefined) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags !== undefined) task.tags = tags;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (actualHours !== undefined) task.actualHours = actualHours;

    await task.save();
    await task.populate('assignee', 'name email');
    await task.populate('creator', 'name email');

    // Create notifications for various changes
    try {
      const notificationPromises = [];

      // Notify for status changes
      if (status !== undefined && status !== originalStatus) {
        if (status === 'done') {
          // Notify project owner if task completed by someone else
          if (project.owner.toString() !== req.user._id.toString()) {
            notificationPromises.push(Notification.create({
              recipient: project.owner,
              type: 'task_completed',
              title: 'Task Completed',
              message: `${req.user.name} completed the task "${task.title}"`,
              relatedProject: project._id,
              relatedTask: task._id,
              sender: req.user._id
            }));
          }

          // Notify task creator if someone else completed it
          if (task.creator._id.toString() !== req.user._id.toString()) {
            notificationPromises.push(Notification.create({
              recipient: task.creator._id,
              type: 'task_completed',
              title: 'Task Completed',
              message: `${req.user.name} completed your task "${task.title}"`,
              relatedProject: project._id,
              relatedTask: task._id,
              sender: req.user._id
            }));
          }
        } else {
          // Notify for other status changes
          const statusLabels = {
            'todo': 'To Do',
            'in-progress': 'In Progress',
            'in-review': 'In Review',
            'done': 'Done'
          };

          // Notify assignee if someone else changed status
          if (task.assignee && task.assignee._id.toString() !== req.user._id.toString()) {
            notificationPromises.push(Notification.create({
              recipient: task.assignee._id,
              type: 'task_status_changed',
              title: 'Task Status Updated',
              message: `${req.user.name} changed the status of "${task.title}" to ${statusLabels[status] || status}`,
              relatedProject: project._id,
              relatedTask: task._id,
              sender: req.user._id
            }));
          }
        }
      }

      // Notify for assignee changes
      if (assignee !== undefined && assignee !== originalAssignee) {
        if (assignee) {
          // Notify new assignee
          if (assignee !== req.user._id.toString()) {
            notificationPromises.push(Notification.create({
              recipient: assignee,
              type: 'task_assigned',
              title: 'Task Assigned',
              message: `${req.user.name} assigned you the task "${task.title}"`,
              relatedProject: project._id,
              relatedTask: task._id,
              sender: req.user._id
            }));
          }
        }

        // Notify old assignee if task was reassigned
        if (originalAssignee && originalAssignee !== req.user._id.toString()) {
          notificationPromises.push(Notification.create({
            recipient: originalAssignee,
            type: 'task_unassigned',
            title: 'Task Reassigned',
            message: `The task "${task.title}" has been reassigned by ${req.user.name}`,
            relatedProject: project._id,
            relatedTask: task._id,
            sender: req.user._id
          }));
        }
      }

      // Notify for priority changes
      if (priority !== undefined && priority !== originalPriority) {
        const priorityLabels = {
          'low': 'Low',
          'medium': 'Medium',
          'high': 'High',
          'urgent': 'Urgent'
        };

        // Notify assignee and project owner
        const recipients = [project.owner.toString()];
        if (task.assignee && !recipients.includes(task.assignee._id.toString())) {
          recipients.push(task.assignee._id.toString());
        }

        recipients.forEach(recipientId => {
          if (recipientId !== req.user._id.toString()) {
            notificationPromises.push(Notification.create({
              recipient: recipientId,
              type: 'task_priority_changed',
              title: 'Task Priority Updated',
              message: `${req.user.name} changed the priority of "${task.title}" to ${priorityLabels[priority] || priority}`,
              relatedProject: project._id,
              relatedTask: task._id,
              sender: req.user._id
            }));
          }
        });
      }

      await Promise.all(notificationPromises);
    } catch (notifError) {
      console.error('Error creating task update notifications:', notifError);
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
router.delete('/:id', jwtAuth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'owner members');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user has access to delete this task (must be creator or project owner)
    const project = task.project;
    const canDelete = task.creator.toString() === req.user._id.toString() ||
                     project.owner.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Populate task details for notifications
    await task.populate('assignee', 'name email');
    await task.populate('creator', 'name email');

    // Send notifications before deletion
    try {
      const notificationPromises = [];

      // Notify assignee if different from deleter
      if (task.assignee && task.assignee._id.toString() !== req.user._id.toString()) {
        notificationPromises.push(Notification.create({
          recipient: task.assignee._id,
          type: 'task_deleted',
          title: 'Task Deleted',
          message: `${req.user.name} deleted the task "${task.title}"`,
          relatedProject: project._id,
          sender: req.user._id
        }));
      }

      // Notify creator if different from deleter
      if (task.creator._id.toString() !== req.user._id.toString()) {
        notificationPromises.push(Notification.create({
          recipient: task.creator._id,
          type: 'task_deleted',
          title: 'Task Deleted',
          message: `${req.user.name} deleted your task "${task.title}"`,
          relatedProject: project._id,
          sender: req.user._id
        }));
      }

      // Notify project owner if different from deleter
      if (project.owner.toString() !== req.user._id.toString()) {
        notificationPromises.push(Notification.create({
          recipient: project.owner,
          type: 'task_deleted',
          title: 'Task Deleted',
          message: `${req.user.name} deleted the task "${task.title}" from your project`,
          relatedProject: project._id,
          sender: req.user._id
        }));
      }

      await Promise.all(notificationPromises);
    } catch (notifError) {
      console.error('Error creating task deletion notifications:', notifError);
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get dashboard stats for tasks
router.get('/stats/dashboard', jwtAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get projects where user is owner or member
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    });

    const projectIds = projects.map(p => p._id);

    // Get tasks from user's projects
    const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });
    const completedTasks = await Task.countDocuments({ 
      project: { $in: projectIds }, 
      status: 'done' 
    });
    const myTasks = await Task.countDocuments({
      $or: [
        { assignee: userId },
        { creator: userId }
      ]
    });
    const overdueTasks = await Task.countDocuments({
      project: { $in: projectIds },
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    });

    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      total: totalTasks,
      completed: completedTasks,
      myTasks,
      overdue: overdueTasks,
      completionPercentage
    });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ error: 'Failed to fetch task statistics' });
  }
});

module.exports = router;
