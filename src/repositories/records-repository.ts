import { Record, Prisma } from '@prisma/client'

export interface RecordsRepository {
  create(data: Prisma.RecordUncheckedCreateInput): Promise<Record>
  findById(id: string): Promise<Record | null>
}