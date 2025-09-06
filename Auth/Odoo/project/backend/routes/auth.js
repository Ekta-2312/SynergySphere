const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controllers/authController');

router.post('/register', controller.register);
router.post('/verify', controller.verify);
router.post('/resend-otp', controller.resendOtp);
router.post('/login', controller.login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed` }), async (req, res) => {
  try {
    console.log('Google callback - req.user:', req.user);
    console.log('Google callback - req.query.state:', req.query.state);
    
    if (!req.user) {
      console.error('No user found in Google callback');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }

    if (!req.user.email) {
      console.error('No email found for user:', req.user);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_email`);
    }

    // Generate JWT token for the user
    const jwt = require('jsonwebtoken');
    const payload = { id: req.user._id, email: req.user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    // Check if this is for an invitation (state parameter contains invitation token)
    const invitationToken = req.query.state;
    
    if (invitationToken) {
      console.log('Processing invitation acceptance for token:', invitationToken);
      
      // Find the invitation
      const ProjectInvitation = require('../models/ProjectInvitation');
      const Project = require('../models/Project');
      const Notification = require('../models/Notification');
      
      const invitation = await ProjectInvitation.findOne({ token: invitationToken })
        .populate('project', 'title description owner');

      if (invitation && invitation.isValid()) {
        // Verify the user email matches invitation
        if (req.user.email === invitation.inviteeEmail) {
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

          console.log('Invitation accepted successfully, redirecting to dashboard');
          
          // Redirect to dashboard with success message
          const userData = encodeURIComponent(JSON.stringify({
            name: req.user.name,
            email: req.user.email
          }));
          
          return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}&user=${userData}&invitation=accepted`);
        } else {
          console.log('Email mismatch for invitation');
          return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${invitationToken}?error=email_mismatch`);
        }
      } else {
        console.log('Invalid or expired invitation');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${invitationToken}?error=invalid_invitation`);
      }
    }

    // Regular Google OAuth login (no invitation)
    const userData = encodeURIComponent(JSON.stringify({
      name: req.user.name,
      email: req.user.email
    }));
    
    console.log('Redirecting to frontend with token and user data');
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}&user=${userData}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
  }
});

module.exports = router;
