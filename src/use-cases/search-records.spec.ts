import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryRecordsRepository } from '../repositories/in-memory/in-memory-records-repository'
import { SearchRecordsUseCase } from './search-records'

describe('Search Records Use Case', () => {
  let recordsRepository: InMemoryRecordsRepository
  let sut: SearchRecordsUseCase

  beforeEach(() => {
    recordsRepository = new InMemoryRecordsRepository()
    sut = new SearchRecordsUseCase(recordsRepository)
  })

  it('should be able to search for records', async () => {
    const datasetId = 'dataset-01'

    await recordsRepository.create({
      datasetId,
      data: { unit: 1, content: 'This is a test record about TypeScript' },
    })

    await recordsRepository.create({
      datasetId,
      data: { unit: 2, content: 'This is another record about JavaScript' },
    })

    await recordsRepository.create({
      datasetId,
      data: { unit: 3, content: 'A third record, this one is about TypeScript and Vitest' },
    })

    const { records } = await sut.execute({
      datasetId,
      query: 'TypeScript',
    })

    expect(records).toHaveLength(2)
    expect(records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ unit: 1 }),
        expect.objectContaining({ unit: 3 }),
      ]),
    )
  })

  it('should return an empty array when no records match the query', async () => {
    const datasetId = 'dataset-01'

    await recordsRepository.create({
      datasetId,
      data: { unit: 1, content: 'This is a test record about TypeScript' },
    })

    const { records } = await sut.execute({
      datasetId,
      query: 'Python',
    })

    expect(records).toHaveLength(0)
  })

  it('should not return records from another dataset', async () => {
    const datasetId1 = 'dataset-01'
    const datasetId2 = 'dataset-02'

    await recordsRepository.create({
      datasetId: datasetId1,
      data: { unit: 1, content: 'Record for dataset 1' },
    })

    await recordsRepository.create({
      datasetId: datasetId2,
      data: { unit: 1, content: 'Record for dataset 2' },
    })

    const { records } = await sut.execute({
      datasetId: datasetId1,
      query: 'Record',
    })

    expect(records).toHaveLength(1)
    expect(records[0].dataset_id).toBe(datasetId1)
  })

  it('should perform a case-insensitive search', async () => {
    const datasetId = 'dataset-01'
    await recordsRepository.create({ datasetId, data: { unit: 1, content: 'Hello World' } })

    const { records } = await sut.execute({ datasetId, query: 'hello' })
    expect(records).toHaveLength(1)
    expect(records[0].unit).toBe(1)
  })
})
