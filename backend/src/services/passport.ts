import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import AppDataSource from '../ormconfig';
import { User } from '../entity/User';

export function configurePassport() {
  // This function is now correctly called from index.ts AFTER DB initialization.
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: '/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        // We can safely access the DB here because this runs after initialization.
        try {
          const userRepository = AppDataSource.getRepository(User);
          let user = await userRepository.findOne({ where: { googleId: profile.id } });

          if (user) {
            // Update tokens if necessary
            user.googleAccessToken = accessToken;
            user.googleRefreshToken = refreshToken; // Note: Refresh token is often only sent on the first authorization
            await userRepository.save(user);
            return done(null, user);
          }

          // If user does not exist, check if email is already in use
          const existingUserByEmail = await userRepository.findOne({ where: { email: profile.emails![0].value } });
          if (existingUserByEmail) {
              // Link the Google account to the existing user
              existingUserByEmail.googleId = profile.id;
              existingUserByEmail.googleAccessToken = accessToken;
              existingUserByEmail.googleRefreshToken = refreshToken;
              await userRepository.save(existingUserByEmail);
              return done(null, existingUserByEmail);
          }


          // Or create a new user
          const newUser = userRepository.create({
            googleId: profile.id,
            email: profile.emails![0].value,
            full_name: profile.displayName,
            email_verified: true, // Email is verified by Google
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken,
          });

          await userRepository.save(newUser);
          done(null, newUser);
        } catch (error) {
          done(error, false);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id } });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

export default passport;
