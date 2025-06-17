
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// JWT strategy for authentication
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret'
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findByPk(payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { google_id: profile.id } });
    
    if (!user) {
      user = await User.findOne({ where: { correo: profile.emails[0].value } });
      
      if (user) {
        // Link existing account to Google
        user.google_id = profile.id;
        await user.save();
      } else {
        // Create new user from Google profile
        user = await User.create({
          nombre: profile.displayName,
          correo: profile.emails[0].value,
          google_id: profile.id,
          role: 'user',
          avatar: profile.photos[0].value
        });
      }
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

module.exports = passport;