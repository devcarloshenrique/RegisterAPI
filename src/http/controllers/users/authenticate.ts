import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { PrismaUsersRepository } from "../../../repositories/prisma/prisma-users-repository";
import { AuthenticateUseCase } from "../../../services/authenticate";
import { InvalidCredentialsError } from "../../../services/erros/invalid-credentials-error";
import { sign } from "jsonwebtoken";
import { env } from "../../../env";

export async function authenticate(req: Request, res: Response) {
  try {
    const authenticateBodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { email, password } = authenticateBodySchema.parse(req.body);

    const prismaUsersRepository = new PrismaUsersRepository();
    const authenticateUseCase = new AuthenticateUseCase(prismaUsersRepository);

    const { user } = await authenticateUseCase.execute({
      email,
      password,
    });

    const token = await sign(
      {
        sub: user.id,
      },
      env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        issues: err.format(),
        status: 400
      });
    }

    if (err instanceof InvalidCredentialsError) {
      return res.status(400).send({ message: err.message })
    }

    throw err;
  }
}