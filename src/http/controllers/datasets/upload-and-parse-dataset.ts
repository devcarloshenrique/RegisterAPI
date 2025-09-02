import { Request, Response } from "express";
import z from "zod";

import { UploadAndParseDatasetUseCase } from "../../../use-cases/upload-and-parse-dataset";
import { PrismaDatasetsRepository } from "../../../repositories/prisma/prisma-datasets-repository";
import { sanitizeOriginalFilename } from "../../../utils/sanitize-filenama";
import { PrismaRecordsRepository } from "../../../repositories/prisma/prisma-records-repository";

const uploadAndParseDatasetBodySchema = z.any()
  .refine((file) => file?.size, `The file is required`)

export async function uploadAndParseDataset(req: Request, res: Response) {
  try {
    const file = uploadAndParseDatasetBodySchema.parse(req.file);
    const userId = req.user.id;

    const prismaDatasetsRepository = new PrismaDatasetsRepository();
    const prismaRecordsRepository = new PrismaRecordsRepository();
    const uploadAndParseDatasetUseCase = new UploadAndParseDatasetUseCase(
      prismaDatasetsRepository,
      prismaRecordsRepository
    );

    const dataset = await uploadAndParseDatasetUseCase.execute({
      userId,
      file: {
        ...file,
        originalname: sanitizeOriginalFilename(file.originalname),
      }
    });

    return res.status(201).json({
      status: 201,
      message: "Dataset created successfully",
      data: {
        ...dataset
      }
    });

  } catch (err) {
    throw err
  }
}