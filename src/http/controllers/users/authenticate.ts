import { Request, Response } from "express";
import { z } from "zod";
import { sign } from "jsonwebtoken";

import { env } from "../../../env";
import { makeAuthenticateUseCase } from "../../../services/factories/make-authenticate-use-case";

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function authenticate(req: Request, res: Response) {
  try {
    const { email, password } = authenticateBodySchema.parse(req.body);
    
    const authenticateUseCase = makeAuthenticateUseCase()
    const { user } = await authenticateUseCase.execute({
      email,
      password,
    });

    const accessToken = await sign(
      { sub: user.id },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      status: 200,
      message: "Authenticated successfully",
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email
        }
      }
    });

  } catch (err) {
    throw err
  }
}