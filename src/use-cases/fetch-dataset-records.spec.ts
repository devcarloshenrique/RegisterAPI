import { it, expect, describe, beforeEach } from 'vitest';
import { FetchDatasetRecordsUseCase } from './fetch-dataset-records';
import { InMemoryDatasetsRepository } from '../repositories/in-memory/in-memory-datasets-repository';
import { InMemoryRecordsRepository } from '../repositories/in-memory/in-memory-records-repository';

describe("Fetch Dataset Records Use Case", () => {
  let datasetsRepository: InMemoryDatasetsRepository;
  let recordsRepository: InMemoryRecordsRepository;
  let sut: FetchDatasetRecordsUseCase;

  beforeEach(() => {
    recordsRepository = new InMemoryRecordsRepository();
    datasetsRepository = new InMemoryDatasetsRepository(recordsRepository);
    sut = new FetchDatasetRecordsUseCase(datasetsRepository);
  })

  it("should be able to fetch dataset records", async () => {
    const userId = 'user-1';
    const mockDataset = {
      name: 'file.pdf',
      user: { connect: { id: userId } },
    }

    const createdDataset = await datasetsRepository.create(mockDataset);

    await recordsRepository.create({
      datasetId: createdDataset.id,
      data: { unit: 1, content: 'Record 1' }
    });

    await recordsRepository.create({
      datasetId: createdDataset.id,
      data: { unit: 2, content: 'Record 2' }
    });

    const { dataset } = await sut.execute({
      userId,
      datasetId: createdDataset.id,
    });

    expect(dataset).not.toBeNull();
    expect(dataset?.id).toEqual(createdDataset.id);
    expect(dataset?.user_id).toEqual(userId);
    expect(dataset?.records.length).toEqual(2);
    expect(dataset?.records[0]).toMatchObject({
      unit: 1,
      data: { content: 'Record 1' }
    })
    expect(dataset?.records[1]).toMatchObject({
      unit: 2,
      data: { content: 'Record 2' }
    })
  })

  it("should not be able to fetch dataset records from another user", async () => {
    const createdDataset = await datasetsRepository.create({
      name: 'file.pdf',
      user: { connect: { id: 'user-1' } },
    })

    const { dataset } = await sut.execute({
      userId: 'user-2',
      datasetId: createdDataset.id,
    });

    expect(dataset).toBeNull();
  })

  it("should not be able to fetch dataset records from non existing dataset", async () => {
    const { dataset } = await sut.execute({
      userId: 'user-1',
      datasetId: 'non-existing-id',
    })

    expect(dataset).toBeNull();
  })

  it("should be able to fetch dataset records with pagination", async () => {
    const userId = 'user-1';
    const createdDataset = await datasetsRepository.create({
      name: 'file.pdf',
      user: { connect: { id: userId } },
    })

    for (let i = 1; i <= 25; i++) {
      await recordsRepository.create({
        datasetId: createdDataset.id,
        data: { unit: i, content: `Content of unit ${i}` }
      })
    }

    const { dataset } = await sut.execute({
      userId,
      datasetId: createdDataset.id,
      pagination: { page: 2, per_page: 10 },
      order: 'asc'
    })

    expect(dataset).not.toBeNull();
    expect(dataset?.records.length).toEqual(10);
    expect(dataset?.records[0].unit).toEqual(11);
    expect(dataset?.records[9].unit).toEqual(20);
  })

  it("should be able to fetch dataset records with pagination", async () => {
    const userId = 'user-1';
    const createdDataset = await datasetsRepository.create({
      name: 'file.pdf',
      user: { connect: { id: userId } },
    })

    await recordsRepository.create({
      datasetId: createdDataset.id,
      data: { unit: 2, content: `Content of unit 2` }
    })
    await recordsRepository.create({
      datasetId: createdDataset.id,
      data: { unit: 1, content: `Content of unit 1` }
    })
    await recordsRepository.create({
      datasetId: createdDataset.id,
      data: { unit: 3, content: `Content of unit 3` }
    })

    const { dataset } = await sut.execute({
      userId,
      datasetId: createdDataset.id,
      order: 'asc'
    })

    expect(dataset).not.toBeNull();
    expect(dataset?.records[0].unit).toEqual(1);
    expect(dataset?.records[1].unit).toEqual(2);
    expect(dataset?.records[2].unit).toEqual(3);

    const { dataset: datasetDesc } = await sut.execute({
      userId,
      datasetId: createdDataset.id,
      order: 'desc'
    })

    expect(datasetDesc).not.toBeNull();
    expect(datasetDesc?.records[0].unit).toEqual(3);
    expect(datasetDesc?.records[1].unit).toEqual(2);
    expect(datasetDesc?.records[2].unit).toEqual(1);

    const { dataset: datasetNoOrder } = await sut.execute({
      userId,
      datasetId: createdDataset.id,
    })

    expect(datasetNoOrder).not.toBeNull();
    expect(datasetNoOrder?.records[0].unit).toEqual(2);
    expect(datasetNoOrder?.records[1].unit).toEqual(1);
    expect(datasetNoOrder?.records[2].unit).toEqual(3);
  })
})