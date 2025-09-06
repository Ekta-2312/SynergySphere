const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Project = require('../models/Project');
const ProjectInvitation = require('../models/ProjectInvitation');
const Register = require('../models/Register');
const Notification = require('../models/Notification');
const jwtAuth = require('../middleware/jwtAuth');
const sendEmail = require('../utils/sendEmail');

// Send project invitation
router.post('/invite', jwtAuth, async (req, res) => {
  try {
    const { projectId, email } = req.body;

    if (!projectId || !email) {
      return res.status(400).json({ error: 'Project ID and email are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only project owner can send invitations' });
    }

    // Check if user is already a member
    const existingUser = await Register.findOne({ email });
    if (existingUser && project.members.includes(existingUser._id)) {
      return res.status(400).json({ error: 'User is already a member of this project' });
    }

    // Check for existing pending invitation
    const existingInvitation = await ProjectInvitation.findOne({
      project: projectId,
      inviteeEmail: email,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return res.status(400).json({ error: 'Invitation already sent to this email' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const invitation = new ProjectInvitation({
      project: projectId,
      inviter: req.user._id,
      inviteeEmail: email,
      inviteeId: existingUser?._id,
      token
    });

    await invitation.save();

    // Send invitation email
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${token}`;
    
    const emailSubject = `Invitation to join "${project.title}" project`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">You've been invited to join a project!</h2>
        
        <p>Hello,</p>
        
        <p><strong>${req.user.name}</strong> has invited you to join the project <strong>"${project.title}"</strong> on SynergySphere.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Project Details:</h3>
          <p><strong>Title:</strong> ${project.title}</p>
          <p><strong>Description:</strong> ${project.description}</p>
          <p><strong>Invited by:</strong> ${req.user.name} (${req.user.email})</p>
        </div>
        
        <p>Click the button below to accept the invitation:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" 
             style="background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%); 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 6px; 
                    font-weight: bold;
                    display: inline-block;">
            Accept Invitation
          </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280;">
          If the button doesn't work, you can copy and paste this link into your browser:<br>
          <a href="${inviteUrl}">${inviteUrl}</a>
        </p>
        
        <p style="font-size: 14px; color: #6b7280;">
          This invitation will expire in 7 days. If you don't have an account, you'll be prompted to create one.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          This email was sent by SynergySphere. If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml
    });

    // Create notification for the inviter
    if (existingUser) {
      await Notification.create({
        recipient: existingUser._id,
        sender: req.user._id,
        type: 'project_invitation',
        title: 'Project Invitation',
        message: `You have been invited to join the project "${project.title}"`,
        relatedProject: project._id
      });
    }

    res.json({ 
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation._id,
        email: email,
        expiresAt: invitation.expiresAt
      }
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Accept project invitation
router.post('/accept/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const invitation = await ProjectInvitation.findOne({ token })
      .populate('project', 'title description owner')
      .populate('inviter', 'name email');

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (!invitation.isValid()) {
      return res.status(400).json({ error: 'Invitation has expired or is no longer valid' });
    }

    // Check if user is authenticated (for existing users)
    let userId = req.user?._id;
    let user = null;
    
    if (userId) {
      // User is logged in, verify they're the invited user
      user = await Register.findById(userId);
      if (user.email !== invitation.inviteeEmail) {
        return res.status(400).json({ 
          error: 'This invitation is for a different email address. Please log in with the correct account or log out to create a new account.' 
        });
      }
    } else {
      // User is not logged in, handle registration/login
      const { email, password, name } = req.body;
      
      // Check if this is for new user registration
      if (!email) {
        return res.status(400).json({ 
          error: 'Please provide email or log in to accept this invitation',
          requiresLogin: true
        });
      }

      if (email !== invitation.inviteeEmail) {
        return res.status(400).json({ 
          error: `This invitation is for ${invitation.inviteeEmail}. Please use the correct email address.` 
        });
      }

      // Check if user exists
      user = await Register.findOne({ email });
      
      if (!user) {
        // User doesn't exist, create new account
        if (!password || !name) {
          return res.status(400).json({ 
            error: 'Name and password are required to create your account',
            requiresRegistration: true,
            email: invitation.inviteeEmail
          });
        }

        if (password.length < 6) {
          return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        
        user = new Register({
          name,
          email,
          password: hashedPassword,
          provider: 'local',
          isVerified: true // Auto-verify invited users
        });
        
        await user.save();
        userId = user._id;
      } else {
        // User exists - check if they're a Google user
        if (user.provider === 'google') {
          return res.status(400).json({ 
            error: 'This email is registered with Google. Please use the Google Sign-In button to accept this invitation.',
            requiresGoogleAuth: true,
            userExists: true,
            isGoogleUser: true
          });
        }
        
        // Local user - verify password
        if (!password) {
          return res.status(400).json({ 
            error: 'This email is already registered. Please provide your password to accept the invitation.',
            requiresLogin: true,
            userExists: true,
            isGoogleUser: false
          });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(400).json({ error: 'Invalid password' });
        }

        userId = user._id;
      }
    }

    // Add user to project
    const project = await Project.findById(invitation.project._id);
    
    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
    }

    // Update invitation status
    invitation.status = 'accepted';
    invitation.respondedAt = new Date();
    invitation.inviteeId = userId;
    await invitation.save();

    // Create notification for project owner
    await Notification.create({
      recipient: project.owner,
      sender: userId,
      type: 'project_update',
      title: 'Invitation Accepted',
      message: `${invitation.inviteeEmail} has joined the project "${project.title}"`,
      relatedProject: project._id
    });

    res.json({ 
      message: 'Invitation accepted successfully',
      project: {
        id: project._id,
        title: project.title,
        description: project.description
      }
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Accept invitation for Google users (after OAuth)
router.post('/accept-google/:token', jwtAuth, async (req, res) => {
  try {
    const { token } = req.params;
    
    const invitation = await ProjectInvitation.findOne({ token })
      .populate('project', 'title description owner')
      .populate('inviter', 'name email');

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (!invitation.isValid()) {
      return res.status(400).json({ error: 'Invitation has expired or is no longer valid' });
    }

    // Verify the authenticated user matches the invitation email
    if (req.user.email !== invitation.inviteeEmail) {
      return res.status(400).json({ 
        error: `This invitation is for ${invitation.inviteeEmail}. Please sign in with the correct Google account.` 
      });
    }

    // Add user to project
    const project = await Project.findById(invitation.project._id);
    
    if (!project.members.includes(req.user._id)) {
      project.members.push(req.user._id);
      await project.save();
    }

    // Update invitation status
    invitation.status = 'accepted';
    invitation.respondedAt = new Date();
    invitation.inviteeId = req.user._id;
    await invitation.save();

    // Create notification for project owner
    await Notification.create({
      recipient: project.owner,
      sender: req.user._id,
      type: 'project_update',
      title: 'Invitation Accepted',
      message: `${invitation.inviteeEmail} has joined the project "${project.title}"`,
      relatedProject: project._id
    });

    res.json({ 
      message: 'Invitation accepted successfully',
      project: {
        id: project._id,
        title: project.title,
        description: project.description
      },
      redirectTo: '/dashboard'
    });

  } catch (error) {
    console.error('Error accepting Google invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Decline project invitation
router.post('/decline/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const invitation = await ProjectInvitation.findOne({ token })
      .populate('project', 'title owner')
      .populate('inviter', 'name email');

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (!invitation.isValid()) {
      return res.status(400).json({ error: 'Invitation has expired or is no longer valid' });
    }

    // Update invitation status
    invitation.status = 'declined';
    invitation.respondedAt = new Date();
    await invitation.save();

    // Create notification for project owner
    await Notification.create({
      recipient: invitation.project.owner,
      sender: invitation.inviter._id,
      type: 'project_update',
      title: 'Invitation Declined',
      message: `${invitation.inviteeEmail} has declined the invitation to join "${invitation.project.title}"`,
      relatedProject: invitation.project._id
    });

    res.json({ message: 'Invitation declined' });

  } catch (error) {
    console.error('Error declining invitation:', error);
    res.status(500).json({ error: 'Failed to decline invitation' });
  }
});

// Get invitation details (for invitation page)
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const invitation = await ProjectInvitation.findOne({ token })
      .populate('project', 'title description')
      .populate('inviter', 'name email');

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (!invitation.isValid()) {
      return res.status(400).json({ error: 'Invitation has expired or is no longer valid' });
    }

    // Check if user already exists
    const existingUser = await Register.findOne({ email: invitation.inviteeEmail });

    res.json({
      project: {
        title: invitation.project.title,
        description: invitation.project.description
      },
      inviter: {
        name: invitation.inviter.name,
        email: invitation.inviter.email
      },
      inviteeEmail: invitation.inviteeEmail,
      expiresAt: invitation.expiresAt,
      userExists: !!existingUser,
      isGoogleUser: existingUser?.provider === 'google'
    });

  } catch (error) {
    console.error('Error fetching invitation:', error);
    res.status(500).json({ error: 'Failed to fetch invitation details' });
  }
});

// Get pending invitations for a project (for project owner)
router.get('/project/:projectId', jwtAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only project owner can view invitations' });
    }

    const invitations = await ProjectInvitation.find({
      project: projectId,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('inviter', 'name email')
      .sort({ createdAt: -1 });

    res.json(invitations);

  } catch (error) {
    console.error('Error fetching project invitations:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

module.exports = router;
