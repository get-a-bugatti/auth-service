import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { userRepository } from "../repositories/user.repository.js";

console.log(
  "Passport's callBackurl is ",
  `${process.env.BACKEND_URL}/api/v1/auth/google/callback`
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
      passReqToCallback: true,
    },
    async function verify(accessToken, refreshToken, params, profile, done) {
      try {
        const googleId = profile.id;
        const username = profile.displayName;

        const authProvider = profile.provider;
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;

        if (!email) {
          return done(
            new Error("No email associated with this google account.", null)
          );
        }

        const givenName = profile.name?.givenName || "";
        const familyName = profile.name?.familyName || "";
        const fullname = `${givenName} ${familyName}`.trim() || username;

        const user = await userRepository.findByGoogleId(profile.id);

        if (user) {
          return done(null, user);
        }

        const existingUser = await userRepository.existsByEmailOrUsername({
          email: profile.emails[0].value,
          username: profile.displayName,
        });

        if (existingUser) {
          return done(null, false, {
            message: "User already exists in local.",
          });
        }

        const newUser = await userRepository.createUser({
          authProvider: authProvider,
          googleId: googleId,
          email: email,
          username: username,
          fullname: fullname,
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
