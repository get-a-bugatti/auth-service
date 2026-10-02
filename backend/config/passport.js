import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { userRepository } from "../repositories/user.repository.js";

const googleStrategyOptions =     {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
      passReqToCallback: true,
      state: false
    };


const redirectPages =  {
  login: "login",
  signup: "signup"
}

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
            name: "email_not_found",
            redirectPage: redirectPages.signup,
          }
          );
        }

        if (!googleId) {
          return done(null, false, {
            name: "googleid_not_found",
            redirectPage: redirectPages.signup,
          })
        }

        const givenName = profile.name?.givenName || "";
        const familyName = profile.name?.familyName || "";
        const fullname = `${givenName} ${familyName}`.trim() || username;

        const existingGoogleAccount = await userRepository.findByGoogleAccount({googleId: profile.id, email: email});

        if (existingGoogleAccount) {
          return done(null, false, {
            name: "user_exists_google",
            redirectPage: redirectPages.login
          });
        }

        const localConflict = await userRepository.existsByEmailOrUsername({
          email: profile.emails[0].value,
          username: profile.displayName,
        });

        if (localConflict) {
          // TODO: To Prevent Pre-Registration ATO, Implement an OTP Email Validation flow here.

          return done(null, false, {
            name: "user_exists_local",
            redirectPage: redirectPages.login,
          });
        }

        const newUser = await userRepository.createUser({
          userData: {
            authProvider: authProvider,
            googleId: googleId,
            email: email,
            username: username,
            fullname: fullname,
          },
          mode: "google"
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
    async function verify(accessToken, refreshToken, params, profile, done) {
      try {
        const googleId = profile.id;
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;
        
          if (!email) {
          return done(null, false, {
            name: "email_not_found",
            redirectPage: redirectPages.signup,
          }
          );
        }

        if (!googleId) {
          return done(null, false, {
            name: "googleid_not_found",
            redirectPage: redirectPages.signup,
          })
        }


        const existingGoogleAccount = await userRepository.findByGoogleAccount({googleId, email});

        if (!existingGoogleAccount) {
          return done(null, false, {
            name: "account_not_found",
            redirectPage: redirectPages.signup
          })
        }

        return done(null, existingGoogleAccount);
      } catch (error) {
        console.error("Oauth Passport Error :", error);
        return done(error, null);
      }
    }
  )
);
