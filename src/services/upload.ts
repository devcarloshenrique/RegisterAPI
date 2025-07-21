import { DatasetsRepository } from "../repositories/datasets-repository";
import { Dataset } from "@prisma/client";
import { DatasetCreationFailure } from "./erros/dataset_creation_failure";

interface DatasetUseCaseRequest {
	name: string;
	metadata?: any;
	userId: string;
}

interface DatasetUseCaseResponse {
	dataset: Dataset
}

export class DatasetUseCase {
	constructor(private datasetsRepository: DatasetsRepository) { }

	async execute({
		name,
		metadata,
		userId
	}: DatasetUseCaseRequest): Promise<DatasetUseCaseResponse> {
		const dataset = await this.datasetsRepository.create({
			name,
			metadata,
			user: {
				connect: {
					id: userId
				}
			}
		});

		if (!dataset) {
			throw new DatasetCreationFailure();
		}

		return {
			dataset
		}
	}
}