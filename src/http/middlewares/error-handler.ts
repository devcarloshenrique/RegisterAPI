import { Request, Response, NextFunction } from "express";
import { env } from "../../env";
import { ZodError } from "zod";
import { MulterError } from "multer";

import { UserAlreadyExistsError } from "../../use-cases/erros/user-already-exists-error";
import { InvalidCredentialsError } from "../../use-cases/erros/invalid-credentials-error";
import { ResourceNotFoundError } from "../../use-cases/erros/resource-not-found-error";
import { InvalidTokenError } from "../../use-cases/erros/invalid-token-error";
import { MulterErrorFactory } from "../../use-cases/erros/make-multer-file-upload-error";
import { MulterFileUploadError } from "../../use-cases/erros/multer-file-upload-error";
import { DatasetNotFound } from "../../use-cases/erros/dataset-not-found";
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { InvalidParameterError } from "../../use-cases/erros/invalid-parameter-error";

interface Error {
  name: string;
  message: string;
  stack?: string;
}

const errorMap = new Map<Function, number>([
  [UserAlreadyExistsError, 409],
  [InvalidCredentialsError, 401],
  [ResourceNotFoundError, 404],
  [InvalidTokenError, 401],
  [DatasetNotFound, 404],
  [PrismaClientValidationError, 400],
  [InvalidParameterError, 400]
]);

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (env.NODE_ENV !== 'production') {
    console.error(err)
  }

  if (err instanceof PrismaClientInitializationError) {
    return res.status(503).json({
      status: 503,
      message: 'Error connecting to the database',
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 400,
      message: 'Validation error',
      issues: err.format()
    });
  }

  if (err instanceof MulterError || err instanceof MulterFileUploadError) {
    const multerError = MulterErrorFactory.create(err);
    return res.status(400).json({
      status: 400,
      message: multerError.message,
    })
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