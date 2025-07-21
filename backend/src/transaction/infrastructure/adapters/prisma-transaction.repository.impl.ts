import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';

import { TransactionRepository } from '../../domain/ports/transaction.repository';
import { TransactionEntity } from '../../domain/entities/transaction.entity';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';

@Injectable()
export class PrismaTransactionRepositoryImpl implements TransactionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(entity: TransactionEntity): Promise<TransactionEntity> {
    const createdTransaction = await this.prismaService.transaction.create({
      data: entity,
    });

    return TransactionEntity.create(
      createdTransaction.id,
      createdTransaction.productId,
      createdTransaction.productQuantity,
      createdTransaction.totalAmount,
      createdTransaction.customerId,
      createdTransaction.paymentMethod as PaymentMethod,
      createdTransaction.status as TransactionStatus,
    );
  }
}
