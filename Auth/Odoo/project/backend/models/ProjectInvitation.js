const mongoose = require('mongoose');

const ProjectInvitationSchema = new mongoose.Schema({
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  inviter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Register', 
    required: true 
  },
  inviteeEmail: { 
    type: String, 
    required: true 
  },
  inviteeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Register'
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined', 'expired'], 
    default: 'pending' 
  },
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  respondedAt: { 
    type: Date 
  }
});

// Index for cleanup of expired invitations
ProjectInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if invitation is valid
ProjectInvitationSchema.methods.isValid = function() {
  return this.status === 'pending' && this.expiresAt > new Date();
};

module.exports = mongoose.model('ProjectInvitation', ProjectInvitationSchema);
