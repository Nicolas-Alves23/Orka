import { Router } from "express";
import * as authController from "./auth.controller";
import { authLimiter } from "../../middlewares/rateLimit.middleware";
import passport from "../../config/passport";
import { env } from "../../config/env";

const router = Router();

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);

router.get(
  "/google",
  authLimiter,
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.FRONTEND_URL}/login?error=oauth_failed`,
  }),
  (req, res) => {
    const { token } = req.user as unknown as { token: string; user: object };
    res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

export default router;
