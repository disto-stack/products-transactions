import { TransactionEntity } from '../entities/transaction.entity';

export interface TransactionRepository {
  save(entity: TransactionEntity): Promise<TransactionEntity>;
}
