import { Request, Response, NextFunction } from "express";
import { DatasetUseCase } from "../../../services/upload";
import { PrismaDatasetsRepository } from "../../../repositories/prisma/prisma-datasets-repository";
import { DatasetCreationFailure } from "../../../services/erros/dataset_creation_failure";
import z, { ZodError } from "zod";

export async function upload(req: Request, res: Response, next: NextFunction) {
  const { file, user } = req
  const userId = user.id

  if (!file) {
    return res.status(400).json({ error: "File not provided" });
  }

  const prismaDatasetsRepository = new PrismaDatasetsRepository();
  const datasetUseCase = new DatasetUseCase(prismaDatasetsRepository);

  try {
    const fileMetadataSchema = z.object({
      originalName: z.string(),
      filename: z.string(),
      path: z.string(),
      size: z.string(),
      fileType: z.string()
    });

    const validatedMetadata = fileMetadataSchema.parse(res.locals.fileMetadata);

    let {
      originalName,
      filename,
      path,
      size,
      fileType
    } = validatedMetadata

    const dataset = await datasetUseCase.execute({
      name: originalName,
      metadata: {
        filename,
        path,
        size,
        fileType
      },
      userId
    })

    res.locals.dataset = dataset;
    next();

  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        issues: err.format(),
        status: 400
      });
    }

    if (err instanceof DatasetCreationFailure) {
      return res.status(500).send({ message: err.message });
    }

    throw err;
  }
}
