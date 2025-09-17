import { PrismaDatasetsRepository } from "../../repositories/prisma/prisma-datasets-repository";
import { UploadAndParseDatasetUseCase } from "../upload-and-parse-dataset";

export function makeUploadAndParseDatasetUseCase() {
  const prismaDatasetsRepository = new PrismaDatasetsRepository();
  const uploadAndParseDatasetUseCase = new UploadAndParseDatasetUseCase(prismaDatasetsRepository);

  return uploadAndParseDatasetUseCase
}