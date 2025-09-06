/**
 * Migration: Add indexes and soft delete functionality
 * Date: 2025-09-06
 * Description: Adds database indexes for performance optimization and soft delete fields
 */

module.exports = {
  async up(db, client) {
    console.log('Running migration: Add indexes and soft delete functionality');
    
    try {
      // Add soft delete fields to existing documents
      await db.collection('tasks').updateMany(
        { isDeleted: { $exists: false } },
        { 
          $set: { 
            isDeleted: false 
          } 
        }
      );

      await db.collection('discussions').updateMany(
        { isDeleted: { $exists: false } },
        { 
          $set: { 
            isDeleted: false 
          } 
        }
      );

      await db.collection('notifications').updateMany(
        { isDeleted: { $exists: false } },
        { 
          $set: { 
            isDeleted: false 
          } 
        }
      );

      // Create indexes for Tasks collection
      await db.collection('tasks').createIndex({ "project": 1, "status": 1 });
      await db.collection('tasks').createIndex({ "project": 1, "assignee": 1 });
      await db.collection('tasks').createIndex({ "assignee": 1, "status": 1 });
      await db.collection('tasks').createIndex({ "project": 1, "status": 1, "assignee": 1 });
      await db.collection('tasks').createIndex({ "creator": 1 });
      await db.collection('tasks').createIndex({ "dueDate": 1 });
      await db.collection('tasks').createIndex({ "priority": 1 });
      await db.collection('tasks').createIndex({ "createdAt": -1 });
      await db.collection('tasks').createIndex({ "updatedAt": -1 });
      await db.collection('tasks').createIndex({ "isDeleted": 1 });

      // Create indexes for Discussions collection
      await db.collection('discussions').createIndex({ "project": 1 });
      await db.collection('discussions').createIndex({ "project": 1, "createdAt": -1 });
      await db.collection('discussions').createIndex({ "author": 1 });
      await db.collection('discussions').createIndex({ "parentDiscussion": 1 });
      await db.collection('discussions').createIndex({ "isPinned": 1, "project": 1 });
      await db.collection('discussions').createIndex({ "isResolved": 1, "project": 1 });
      await db.collection('discussions').createIndex({ "isDeleted": 1 });

      // Create indexes for Notifications collection
      await db.collection('notifications').createIndex({ "recipient": 1, "isRead": 1 });
      await db.collection('notifications').createIndex({ "recipient": 1, "createdAt": -1 });
      await db.collection('notifications').createIndex({ "recipient": 1, "type": 1 });
      await db.collection('notifications').createIndex({ "isRead": 1 });
      await db.collection('notifications').createIndex({ "createdAt": -1 });
      await db.collection('notifications').createIndex({ "isDeleted": 1 });

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down(db, client) {
    console.log('Rolling back migration: Add indexes and soft delete functionality');
    
    try {
      // Remove soft delete fields
      await db.collection('tasks').updateMany(
        {},
        { 
          $unset: { 
            isDeleted: "",
            deletedAt: "",
            deletedBy: ""
          } 
        }
      );

      await db.collection('discussions').updateMany(
        {},
        { 
          $unset: { 
            isDeleted: "",
            deletedAt: "",
            deletedBy: ""
          } 
        }
      );

      await db.collection('notifications').updateMany(
        {},
        { 
          $unset: { 
            isDeleted: "",
            deletedAt: ""
          } 
        }
      );

      // Drop indexes for Tasks collection
      try {
        await db.collection('tasks').dropIndex({ "project": 1, "status": 1 });
        await db.collection('tasks').dropIndex({ "project": 1, "assignee": 1 });
        await db.collection('tasks').dropIndex({ "assignee": 1, "status": 1 });
        await db.collection('tasks').dropIndex({ "project": 1, "status": 1, "assignee": 1 });
        await db.collection('tasks').dropIndex({ "creator": 1 });
        await db.collection('tasks').dropIndex({ "dueDate": 1 });
        await db.collection('tasks').dropIndex({ "priority": 1 });
        await db.collection('tasks').dropIndex({ "createdAt": -1 });
        await db.collection('tasks').dropIndex({ "updatedAt": -1 });
        await db.collection('tasks').dropIndex({ "isDeleted": 1 });
      } catch (e) {
        console.log('Some task indexes may not exist, continuing...');
      }

      // Drop indexes for Discussions collection
      try {
        await db.collection('discussions').dropIndex({ "project": 1 });
        await db.collection('discussions').dropIndex({ "project": 1, "createdAt": -1 });
        await db.collection('discussions').dropIndex({ "author": 1 });
        await db.collection('discussions').dropIndex({ "parentDiscussion": 1 });
        await db.collection('discussions').dropIndex({ "isPinned": 1, "project": 1 });
        await db.collection('discussions').dropIndex({ "isResolved": 1, "project": 1 });
        await db.collection('discussions').dropIndex({ "isDeleted": 1 });
      } catch (e) {
        console.log('Some discussion indexes may not exist, continuing...');
      }

      // Drop indexes for Notifications collection
      try {
        await db.collection('notifications').dropIndex({ "recipient": 1, "isRead": 1 });
        await db.collection('notifications').dropIndex({ "recipient": 1, "createdAt": -1 });
        await db.collection('notifications').dropIndex({ "recipient": 1, "type": 1 });
        await db.collection('notifications').dropIndex({ "isRead": 1 });
        await db.collection('notifications').dropIndex({ "createdAt": -1 });
        await db.collection('notifications').dropIndex({ "isDeleted": 1 });
      } catch (e) {
        console.log('Some notification indexes may not exist, continuing...');
      }

      console.log('Rollback completed successfully');
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  }
};
