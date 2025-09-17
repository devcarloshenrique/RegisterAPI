import { makeParser } from "../../infra/parsers/factories/make-parser";
import { PrismaDatasetsRepository } from "../../repositories/prisma/prisma-datasets-repository";
import { PrismaRecordsRepository } from "../../repositories/prisma/prisma-records-repository";
import { ProcessDatasetUseCase } from "../process-dataset";

export function makeProcessDatasetUseCase(mimeType: string) {
  const prismaDatasetsRepository = new PrismaDatasetsRepository();
  const prismaRecordsRepository = new PrismaRecordsRepository();
  const parser = makeParser(mimeType);

  return new ProcessDatasetUseCase(
    prismaDatasetsRepository,
    prismaRecordsRepository,
    parser,
  );
}