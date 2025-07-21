import { Request, Response } from "express";
import { PrismaUsersRepository } from "../../../repositories/prisma/prisma-users-repository";
import { GetUserProfileUseCase } from "../../../services/get-user-profile";

export async function profile(req: Request, res: Response) {
  const prismaUsersRepository = new PrismaUsersRepository();
  const registerUseCase = new GetUserProfileUseCase(prismaUsersRepository);

  const { user } = await registerUseCase.execute({
    userId: req.user.id as string
  });

  return res.status(200).json({
    user: {
      ...user,
      password_hash: undefined,
    }
  });
}