import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import z from "zod";

import { env } from "../../env";
import { InvalidTokenError } from "../../services/erros/invalid-token-error";

interface PayloadJWT {
  sub: string;
}

const verifyJwtBodySchema = z.object({
  authorization: z.string()
    .startsWith("Bearer ")
    .transform((value) => value.split(" ")[1]),
})

export async function verifyJwt(req: Request, res: Response, next: NextFunction) {
  try {
    const { data } = verifyJwtBodySchema.safeParse(req.headers);

    const token = data?.authorization as string;

    const { sub } = verify(token, env.JWT_SECRET) as PayloadJWT;

    req.user = {
      id: sub,
    };

    return next();
  } catch (err) {
    throw new InvalidTokenError()
  }
}