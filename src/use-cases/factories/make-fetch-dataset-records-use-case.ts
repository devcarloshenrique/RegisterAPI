import { PrismaDatasetsRepository } from "../../repositories/prisma/prisma-datasets-repository";
import { FetchDatasetRecordsUseCase } from "../fetch-dataset-records";

export function makeFetchDatasetRecordsUseCase() {
  const datasetsRepository = new PrismaDatasetsRepository()
  const fetchDatasetUseCase = new FetchDatasetRecordsUseCase(datasetsRepository)

  return fetchDatasetUseCase
}