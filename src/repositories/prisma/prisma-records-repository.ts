import { prisma } from '../../lib/prisma'
import { RecordsRepository } from '../records-repository'
import { Prisma } from '@prisma/client'

export class PrismaRecordsRepository implements RecordsRepository {
  async create(data: Prisma.RecordUncheckedCreateInput) {
    const record = await prisma.record.create({
      data
    })

    return record
  }

  async findById(id: string) {
    const record = await prisma.record.findUnique({
      where: { id }
    })

    return record
  }
}