import { Request, Response } from "express";
import { makeGetUserProfileUseCase } from "../../../use-cases/factories/make-get-user-profile-use-case";

export async function profile(req: Request, res: Response) {
  try {
    const getProfileUseCase = makeGetUserProfileUseCase();

    const { user } = await getProfileUseCase.execute({
      userId: req.user.id as string
    });

    return res.status(200).json({
      status: 200,
      message: "User profile retrieved successfully",
      data: {
        user: {
          ...user,
          password_hash: undefined,
        }
      }
    });
  } catch (err) {
    throw err
  }
}