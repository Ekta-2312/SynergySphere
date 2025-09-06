const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Register = require('../models/Register');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
      // Use an absolute callback URL so it matches the URL you register in Google Cloud Console
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google Strategy - Profile:', JSON.stringify(profile, null, 2));

        if (!profile.emails || profile.emails.length === 0) {
          console.error('No email found in Google profile');
          return done(new Error('No email found in Google profile'), null);
        }

        const email = profile.emails[0].value;
        console.log('Google Strategy - Email:', email);

        const user = await Register.findOne({ email });

        if (user) {
          console.log('Existing user found:', user.email);
          return done(null, user);
        } else {
          console.log('Creating new user for:', email);
          const newUser = new Register({
            name: profile.displayName,
            email: email,
            provider: 'google',
            isVerified: true // Google users are considered verified
          });

          await newUser.save();
          console.log('New user created:', newUser.email);
          return done(null, newUser);
        }
      } catch (err) {
        console.error('Google Strategy error:', err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Register.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
