import { Request, Response, NextFunction} from "express";
import { z, ZodError } from "zod";
import { RegisterUseCase } from "../../../services/register";
import { PrismaUsersRepository } from "../../../repositories/prisma/prisma-users-repository";
import { UserAlreadyExistsError } from "../../../services/erros/user-already-exists-error";

export async function register(req: Request, res: Response) {
	try {
		const registerBodySchema = z.object({
			name: z.string(),
			email: z.string().email(),
			password: z.string().min(6),
		});

		const { name, email, password } = registerBodySchema.parse(req.body);

		const prismaUsersRepository = new PrismaUsersRepository();
		const registerUseCase = new RegisterUseCase(prismaUsersRepository); 

		await registerUseCase.execute({
			name,
			email,
			password,
		});

	} catch (err) {
		if (err instanceof UserAlreadyExistsError) {
			return res.status(409).send({ message: err.message });
		}

		if (err instanceof ZodError) {
			return res.status(400).json({
				message: 'Validation error',
				issues: err.format(),
				status: 400
			})
		}
		
		throw err;
	}

	return res.status(201).send();
}
