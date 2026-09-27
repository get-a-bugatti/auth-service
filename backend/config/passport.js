import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { userRepository } from "../repositories/user.repository.js";

console.log(
  "Passport's callBackurl is ",
  `${process.env.BACKEND_URL}/api/v1/auth/google/callback`
);

const googleStrategyOptions =     {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
      passReqToCallback: true,
    };

/* For Reference */
// const errorsMap = {
//   "email_not_found": "No email associated with this google account.",
//   "user_exists_local": "User already exists in local.",
//   "account_not_found": "No account found associated with this Google email."
// }

passport.use( 'google-signup',
  new GoogleStrategy(
   googleStrategyOptions,
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
          return done(null, false, {
            name: "email_not_found"
          }
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
            name: "user_exists_local",
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
        console.error("Error", error);
        return done(error, null);
      }
    }
  )
);

passport.use( 'google-login',
  new GoogleStrategy(
   googleStrategyOptions,
    async function verifyForLogin(accessToken, refreshToken, params, profile, done) {
      try {
        const googleId = profile.id;
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;

        if (!email) {
            throw new Error("No email found associated with this google account.", null)
        }

        const user = await userRepository.findByGoogleId(googleId);

        if (!user) {
          return done(null, false, {
            name: "account_not_found",
          })
        }

        return done(null, user);
      } catch (error) {
        console.error("Oauth Passport Error :", error);
        return done(error, null);
      }
    }
  )
);
