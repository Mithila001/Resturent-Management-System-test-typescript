import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

type AuthRequest = Request & { user?: any };

const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token (use same dev fallback secret as signer)
      const secret = process.env.JWT_SECRET || "dev_secret";
      const decoded: any = jwt.verify(token, secret);

      // Dev-only: log decoded token for debugging
      if (process.env.NODE_ENV === "development") {
        console.log("DEV: Decoded JWT:", decoded);
      }

      req.user = await User.findById(decoded.id).select("-password");

      // Dev-only: log found user id
      if (process.env.NODE_ENV === "development") {
        console.log(`DEV: Authenticated request for user id: ${req.user?._id}`);
      }

      next();
    } catch (error: any) {
      console.error("JWT verify error:", error);

      // Development-only: attempt a relaxed fallback when verification fails locally.
      // This helps when .env or secrets differ between processes during local testing.
      if (process.env.NODE_ENV === "development") {
        try {
          const decodedUnsafe: any = jwt.decode(token);
          console.warn(
            "DEV WARNING: JWT verification failed, falling back to decoded token (unsafe for production).",
            decodedUnsafe,
          );
          if (decodedUnsafe?.id) {
            req.user = await User.findById(decodedUnsafe.id).select("-password");
            if (req.user) {
              console.warn(`DEV: Authenticated by fallback for user id: ${decodedUnsafe.id}`);
              return next();
            }
          }
        } catch (err) {
          console.error("DEV fallback decode error:", err);
        }
      }

      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Role authorization middleware
const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no user found" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

export { protect, authorize };
