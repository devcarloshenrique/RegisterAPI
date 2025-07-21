import { prisma } from "../../lib/prisma";
import { Prisma, Dataset } from "@prisma/client";
import { DatasetsRepository } from "../datasets-repository";

export class PrismaDatasetsRepository implements DatasetsRepository {
  findById(id: string): Promise<Dataset | null> {
    throw new Error("Method not implemented.");
  }

  async create(data: Prisma.DatasetCreateInput): Promise<Dataset> {
    const dataset = await prisma.dataset.create({
      data,
    });

    return dataset
  }
}
