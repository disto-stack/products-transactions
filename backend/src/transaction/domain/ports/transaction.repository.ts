import { TransactionEntity } from '../entities/transaction.entity';

export interface TransactionRepository {
  save(entity: TransactionEntity): Promise<TransactionEntity>;
  update(entity: TransactionEntity): Promise<TransactionEntity>;
  findById(id: string): Promise<TransactionEntity | null>;
}
