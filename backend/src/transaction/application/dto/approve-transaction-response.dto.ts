import { TransactionStatus } from 'src/transaction/domain/enums/transaction-status.enum';

export class ApproveTransactionResponseDto {
  transaction: {
    id: string;
    status: TransactionStatus;
  };
}
