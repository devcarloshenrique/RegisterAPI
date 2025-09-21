import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryDatasetsRepository } from '../repositories/in-memory/in-memory-datasets-repository';
import { FetchDatasetsUseCase } from './fetch-datasets';
import { InMemoryRecordsRepository } from '../repositories/in-memory/in-memory-records-repository';

describe("Fetch Datasets Use Case", () => {
  let recordsRepository: InMemoryRecordsRepository
  let datasetsRepository: InMemoryDatasetsRepository
  let sut: FetchDatasetsUseCase

  beforeEach(() => {
    recordsRepository = new InMemoryRecordsRepository();  
    datasetsRepository = new InMemoryDatasetsRepository(recordsRepository)
    sut = new FetchDatasetsUseCase(datasetsRepository)  
  })

  it("should be able to fetch datasets", async () => {
    const userId = 'user-1';
    const fakeDataset = {
      name: 'file.pdf',
      metadata: {},
      user: { connect: { id: userId } }
    };    
    
    const createdFakeDataset = await datasetsRepository.create(fakeDataset);

    const { datasets } = await sut.execute({
      userId
    })

    expect(datasets).toHaveLength(1);
    expect(datasets[0].name).toBe('file.pdf');
    expect(datasets[0].id).toEqual(createdFakeDataset.id);
  })

  it("should not be able from another user to fetch datasets", async () => {
    await datasetsRepository.create({
      name: 'user-1-file.pdf',
      metadata: {},
      user: { connect: { id: 'user-1' } }
    })
    
    await datasetsRepository.create({
      name: 'user-2-file.pdf',
      metadata: {},
      user: { connect: { id: 'user-2' } }
    })

    const { datasets } = await sut.execute({
      userId: 'user-1'
    })

    expect(datasets).toHaveLength(1)
    expect(datasets[0].name).toBe('user-1-file.pdf')
  })

  it("should return an empty array when a user has no datasets", async () => {
    const { datasets } = await sut.execute({
      userId: 'non-existing-user'
    })

    expect(datasets).toHaveLength(0)
  })
})