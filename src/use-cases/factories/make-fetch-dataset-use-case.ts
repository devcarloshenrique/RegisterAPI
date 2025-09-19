import { PrismaDatasetsRepository } from "../../repositories/prisma/prisma-datasets-repository";
import { FetchDatasetsUseCase } from "../fetch-datasets";

export function makeFetchDatasetUseCase() {
  const datasetsRepository = new PrismaDatasetsRepository();
  const fetchDatasetsUseCase = new FetchDatasetsUseCase(datasetsRepository);

  return fetchDatasetsUseCase
}