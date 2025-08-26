import { Request, Response, NextFunction } from "express";
import { env } from "../../env";
import { ZodError } from "zod";

import { UserAlreadyExistsError } from "../../services/erros/user-already-exists-error";
import { InvalidCredentialsError } from "../../services/erros/invalid-credentials-error";
import { ResourceNotFoundError } from "../../services/erros/resource-not-found-error";
import { InvalidTokenError } from "../../services/erros/invalid-token-error";

interface Error {
  name: string;
  message: string;
  stack?: string;
}

const errorMap = new Map<Function, number>([
  [UserAlreadyExistsError,409],
  [InvalidCredentialsError, 401],
  [ResourceNotFoundError, 404],
  [InvalidTokenError, 401]
]);

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (env.NODE_ENV !== 'production') {
    console.error(err)
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 400,
      message: 'Validation error',
      issues: err.format()
    });
  }

  for (const [errorClass, statusCode] of errorMap) { 
    if (err instanceof errorClass) {       
      return res.status(statusCode).json({
        status: statusCode,
        message: err.message,
      });

    }
  }
  
  return res.status(500).json({
    status: 500,
    message: 'Internal server error',
  });

}