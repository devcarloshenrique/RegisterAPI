import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { env } from "../../env";

interface PayloadJWT {
  sub: string;
}

export async function verifyJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token not provided" });
  }

  const [, token] = authHeader.split(" ");
  try {
    const { sub } = verify(token, env.JWT_SECRET) as PayloadJWT;

    req.user = {
      id: sub,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}