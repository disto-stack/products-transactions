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

  async update(entity: TransactionEntity): Promise<TransactionEntity> {
    const updatedTransaction = await this.prismaService.transaction.update({
      where: { id: entity.id },
      data: {
        productId: entity.productId,
        productQuantity: entity.productQuantity,
        totalAmount: entity.totalAmount,
        customerId: entity.customerId,
        paymentMethod: entity.paymentMethod,
        status: entity.status,
      },
    });

    return TransactionEntity.create(
      updatedTransaction.id,
      updatedTransaction.productId,
      updatedTransaction.productQuantity,
      updatedTransaction.totalAmount,
      updatedTransaction.customerId,
      updatedTransaction.paymentMethod as PaymentMethod,
      updatedTransaction.status as TransactionStatus,
    );
  }

  async findById(id: string): Promise<TransactionEntity | null> {
    const transaction = await this.prismaService.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return null;
    }

    return TransactionEntity.create(
      transaction.id,
      transaction.productId,
      transaction.productQuantity,
      transaction.totalAmount,
      transaction.customerId,
      transaction.paymentMethod as PaymentMethod,
      transaction.status as TransactionStatus,
    );
  }
}
