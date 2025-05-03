import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel';
import UserProfile from '../models/userProfileModel';
import generateToken from '../utils/generateToken';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails![0].value });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // Create new user if doesn't exist
        const newUser = await User.create({
          email: profile.emails![0].value,
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          password: Math.random().toString(36).slice(-8), // Random password
          profileComplete: false,
        });

        // Create empty user profile
        await UserProfile.create({
          user: newUser._id,
          isComplete: false,
          basicInfo: {
            fullName: `${newUser.firstName} ${newUser.lastName}`,
            email: newUser.email
          }
        });

        return done(null, newUser);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}); 