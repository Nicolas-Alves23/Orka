import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env";
import { googleAuth } from "../modules/auth/auth.service";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("E-mail não disponível no perfil Google"));

        const result = await googleAuth({
          googleId: profile.id,
          email,
          name: profile.displayName,
        });

        done(null, result as unknown as Express.User);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

export default passport;
