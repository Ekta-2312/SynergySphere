/**
 * Task Service Layer
 * Handles all business logic related to tasks
 * @module TaskService
 */

const Task = require('../models/Task');
const Project = require('../models/Project');
const TaskAuditLog = require('../models/TaskAuditLog');
const TaskAuditMiddleware = require('../middleware/taskAudit');
const { addSoftDeleteFilter, getPaginationOptions } = require('../utils/dbUtils');
const mongoose = require('mongoose');

/**
 * Valid task statuses
 */
const TASK_STATUSES = ['todo', 'in-progress', 'in-review', 'done'];

/**
 * Service class for managing tasks
 */
class TaskService {
  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @param {string} taskData.title - Task title
   * @param {string} taskData.description - Task description
   * @param {string} taskData.project - Project ID
   * @param {string} taskData.assignee - Assignee user ID
   * @param {Date} taskData.dueDate - Due date
   * @param {string} taskData.priority - Task priority
   * @param {string} creator - ID of user creating the task
   * @returns {Promise<Object>} Created task with populated fields
   * @throws {Error} If task creation fails
   */
  async createTask(taskData, creator) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      // Verify project exists and user has access
      const project = await Project.findOne({
        _id: taskData.project,
        teamMembers: creator,
        isDeleted: { $ne: true }
      }).session(session);

      if (!project) {
        throw new Error('Project not found or unauthorized');
      }

      // Verify assignee is part of the project
      if (taskData.assignee && !project.teamMembers.includes(taskData.assignee)) {
        throw new Error('Assignee must be a project team member');
      }

      const task = new Task({
        ...taskData,
        creator,
        status: 'todo',
        isDeleted: false
      });

      const savedTask = await task.save({ session });
      await savedTask.populate('project assignee creator', 'name title username email');
      
      await session.commitTransaction();
      return savedTask;
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Failed to create task: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  /**
   * Update task status with audit logging
   * @param {string} taskId - Task ID
   * @param {string} newStatus - New status
   * @param {string} userId - User making the change
   * @returns {Promise<Object>} Updated task
   * @throws {Error} If status is invalid or user unauthorized
   */
  async updateTaskStatus(taskId, newStatus, userId) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      if (!TASK_STATUSES.includes(newStatus)) {
        throw new Error(`Invalid status. Must be one of: ${TASK_STATUSES.join(', ')}`);
      }

      const task = await Task.findOne({
        _id: taskId,
        isDeleted: { $ne: true }
      }).populate('project').session(session);

      if (!task) {
        throw new Error('Task not found');
      }

      // Check if user has permission (project member)
      if (!task.project.teamMembers.includes(userId)) {
        throw new Error('Unauthorized to update this task');
      }

      const oldStatus = task.status;
      task.status = newStatus;
      task.updatedAt = new Date();

      if (newStatus === 'done') {
        task.completedAt = new Date();
      }

      await task.save({ session });
      
      // Log the status change for audit trail
      await this.logTaskStatusChange(taskId, oldStatus, newStatus, userId, session);
      
      await session.commitTransaction();
      return await task.populate('assignee createdBy', 'username email');
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Failed to update task status: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  /**
   * Get tasks for a project with filtering and pagination
   * @param {string} projectId - Project ID
   * @param {Object} filters - Filter options
   * @param {string} filters.status - Filter by status
   * @param {string} filters.assignee - Filter by assignee
   * @param {boolean} filters.overdue - Filter overdue tasks
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated tasks with metadata
   */
  async getProjectTasks(projectId, filters = {}, page = 1, limit = 20) {
    try {
      const query = {
        project: projectId,
        isDeleted: { $ne: true }
      };

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.assignee) {
        query.assignee = filters.assignee;
      }
      
      if (filters.overdue) {
        query.dueDate = { $lt: new Date() };
        query.status = { $ne: 'done' };
      }

      const skip = (page - 1) * limit;
      
      const tasks = await Task.find(query)
        .populate('assignee createdBy', 'username email')
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Task.countDocuments(query);

      return {
        tasks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get project tasks: ${error.message}`);
    }
  }

  /**
   * Get tasks assigned to a user
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} User's tasks with pagination
   */
  async getUserTasks(userId, filters = {}, page = 1, limit = 20) {
    try {
      const query = {
        assignee: userId,
        isDeleted: { $ne: true }
      };

      if (filters.status) {
        query.status = filters.status;
      }

      const skip = (page - 1) * limit;
      
      const tasks = await Task.find(query)
        .populate('project', 'name')
        .populate('createdBy', 'username email')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit);

      const total = await Task.countDocuments(query);

      return {
        tasks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get user tasks: ${error.message}`);
    }
  }

  /**
   * Soft delete a task
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted task
   */
  async deleteTask(taskId, userId) {
    try {
      const task = await Task.findOne({
        _id: taskId,
        isDeleted: { $ne: true }
      }).populate('project');

      if (!task) {
        throw new Error('Task not found');
      }

      // Check permission (project member or task creator)
      if (!task.project.teamMembers.includes(userId) && task.createdBy.toString() !== userId) {
        throw new Error('Unauthorized to delete this task');
      }

      task.isDeleted = true;
      task.deletedAt = new Date();
      await task.save();

      return task;
    } catch (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  /**
   * Calculate project progress based on task statuses
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Progress statistics
   */
  async calculateProjectProgress(projectId) {
    try {
      const pipeline = [
        {
          $match: {
            project: new mongoose.Types.ObjectId(projectId),
            isDeleted: { $ne: true }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ];

      const statusCounts = await Task.aggregate(pipeline);
      
      const counts = {
        todo: 0,
        'in-progress': 0,
        'in-review': 0,
        done: 0
      };

      statusCounts.forEach(item => {
        counts[item._id] = item.count;
      });

      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      
      if (total === 0) {
        return { percentage: 0, counts, total };
      }

      // Calculate weighted progress
      const progress = (
        (counts['in-progress'] * 0.25) +
        (counts['in-review'] * 0.75) +
        (counts.done * 1.0)
      ) / total;

      return {
        percentage: Math.round(progress * 100),
        counts,
        total
      };
    } catch (error) {
      throw new Error(`Failed to calculate project progress: ${error.message}`);
    }
  }

  /**
   * Get task audit history
   * @param {string} taskId - Task ID
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} Task audit history
   */
  async getTaskHistory(taskId, limit = 50) {
    try {
      return await TaskAuditLog.getTaskHistory(taskId, limit);
    } catch (error) {
      throw new Error(`Failed to get task history: ${error.message}`);
    }
  }

  /**
   * Restore a soft-deleted task
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID performing the restoration
   * @param {Object} metadata - Additional metadata for audit
   * @returns {Promise<Object>} Restored task
   */
  async restoreTask(taskId, userId, metadata = {}) {
    try {
      const task = await Task.findOne({
        _id: taskId,
        isDeleted: true
      }).populate('project');

      if (!task) {
        throw new Error('Deleted task not found');
      }

      // Check permission (project member)
      if (!task.project.teamMembers.includes(userId)) {
        throw new Error('Unauthorized to restore this task');
      }

      await task.restore();
      
      // Log restoration
      await TaskAuditMiddleware.logTaskRestoration(task, userId, metadata);

      return await task.populate('assignee creator', 'name email username');
    } catch (error) {
      throw new Error(`Failed to restore task: ${error.message}`);
    }
  }

  /**
   * Get deleted tasks for a project (for recovery purposes)
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @param {Object} paginationOptions - Pagination options
   * @returns {Promise<Object>} Deleted tasks with pagination
   */
  async getDeletedTasks(projectId, userId, paginationOptions = {}) {
    try {
      // Verify user has access to project
      const project = await Project.findOne({
        _id: projectId,
        teamMembers: userId,
        isDeleted: { $ne: true }
      });

      if (!project) {
        throw new Error('Project not found or access denied');
      }

      const { skip, limit, sort } = getPaginationOptions(paginationOptions);
      
      const query = {
        project: projectId,
        isDeleted: true
      };

      const tasks = await Task.find(query)
        .populate('assignee creator deletedBy', 'name email username')
        .populate('project', 'title')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Task.countDocuments(query);

      return {
        tasks,
        pagination: {
          currentPage: paginationOptions.page || 1,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: skip + limit < total,
          hasPrev: skip > 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to get deleted tasks: ${error.message}`);
    }
  }

  /**
   * Enhanced task creation with audit logging
   * @param {Object} taskData - Task data
   * @param {string} creator - User ID creating the task
   * @param {Object} metadata - Additional metadata for audit
   * @returns {Promise<Object>} Created task
   */
  async createTaskWithAudit(taskData, creator, metadata = {}) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      // Verify project exists and user has access
      const project = await Project.findOne({
        _id: taskData.project,
        teamMembers: creator,
        isDeleted: { $ne: true }
      }).session(session);

      if (!project) {
        throw new Error('Project not found or access denied');
      }

      // Verify assignee is part of the project
      if (taskData.assignee && !project.teamMembers.includes(taskData.assignee)) {
        throw new Error('Assignee must be a project team member');
      }

      const task = new Task({
        ...taskData,
        creator,
        status: 'todo',
        isDeleted: false
      });

      const savedTask = await task.save({ session });
      await savedTask.populate('project assignee creator', 'name title username email');
      
      // Log task creation
      await TaskAuditMiddleware.logTaskCreation(savedTask, creator, metadata);
      
      await session.commitTransaction();
      return savedTask;
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Failed to create task: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  /**
   * Enhanced task update with audit logging
   * @param {string} taskId - Task ID
   * @param {Object} updateData - Update data
   * @param {string} userId - User ID performing the update
   * @param {Object} metadata - Additional metadata for audit
   * @returns {Promise<Object>} Updated task
   */
  async updateTaskWithAudit(taskId, updateData, userId, metadata = {}) {
    try {
      const originalTask = await Task.findOne({
        _id: taskId,
        isDeleted: { $ne: true }
      }).populate('project').lean();

      if (!originalTask) {
        throw new Error('Task not found');
      }

      // Check if user has permission
      if (!originalTask.project.teamMembers.includes(userId)) {
        throw new Error('Unauthorized to update this task');
      }

      const updatedTask = await Task.findOneAndUpdate(
        { _id: taskId, isDeleted: { $ne: true } },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).populate('project assignee creator', 'name title username email');

      // Log the update
      await TaskAuditMiddleware.logTaskUpdate(originalTask, updatedTask, userId, metadata);

      return updatedTask;
    } catch (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  /**
   * Enhanced task deletion with audit logging
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID performing the deletion
   * @param {Object} metadata - Additional metadata for audit
   * @returns {Promise<Object>} Deleted task
   */
  async deleteTaskWithAudit(taskId, userId, metadata = {}) {
    try {
      const task = await Task.findOne({
        _id: taskId,
        isDeleted: { $ne: true }
      }).populate('project');

      if (!task) {
        throw new Error('Task not found');
      }

      // Check permission (project member or task creator)
      if (!task.project.teamMembers.includes(userId) && task.creator.toString() !== userId) {
        throw new Error('Unauthorized to delete this task');
      }

      await task.softDelete(userId);
      
      // Log deletion
      await TaskAuditMiddleware.logTaskDeletion(task, userId, metadata);

      return await task.populate('assignee creator deletedBy', 'name email username');
    } catch (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  /**
   * Log task status changes for audit trail
   * @private
   * @param {string} taskId - Task ID
   * @param {string} oldStatus - Previous status
   * @param {string} newStatus - New status
   * @param {string} userId - User making the change
   * @param {Object} session - Database session
   */
  async logTaskStatusChange(taskId, oldStatus, newStatus, userId, session) {
    const TaskAudit = mongoose.model('TaskAudit', {
      task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
      oldStatus: String,
      newStatus: String,
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Register' },
      changedAt: { type: Date, default: Date.now }
    });

    await new TaskAudit({
      task: taskId,
      oldStatus,
      newStatus,
      changedBy: userId
    }).save({ session });
  }
}

module.exports = new TaskService();
