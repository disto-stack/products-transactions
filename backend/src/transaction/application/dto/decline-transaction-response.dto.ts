import { TransactionStatus } from 'src/transaction/domain/enums/transaction-status.enum';

export class DeclineTransactionResponseDto {
  transaction: {
    id: string;
    status: TransactionStatus;
  };
}
