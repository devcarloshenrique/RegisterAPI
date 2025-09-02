import { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { makeRegisterUseCase } from "../../../use-cases/factories/make-register-use-case";

const registerBodySchema = z.object({
	name: z.string(),
	email: z.string().email(),
	password: z.string().min(6),
});

export async function register(req: Request, res: Response, next: NextFunction) {
	try {
		const { name, email, password } = registerBodySchema.parse(req.body);

		const registerUseCase = makeRegisterUseCase()
		await registerUseCase.execute({
			name,
			email,
			password,
		});

		return res.status(201).json({
			status: 201,
			message: "User registered successfully",
		});

	} catch (err) {
		throw err
	}
}
