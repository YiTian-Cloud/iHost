import jwt from "jsonwebtoken";

export interface AuthTokenPayload {
  userId: string;
}

// Grab from env
const rawJwtSecret = process.env.JWT_SECRET;

// Fail fast if missing (at build/start time)
if (!rawJwtSecret) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// ✅ Now we have a real string that TS is happy with
const JWT_SECRET: string = rawJwtSecret;

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // Ensure it has the shape we expect
    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.userId !== "string"
    ) {
      return null;
    }

    return { userId: decoded.userId };
  } catch (err) {
    // invalid/expired token, etc.
    return null;
  }
}
