// src/transaction/application/use-cases/approve-transaction.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { TransactionRepository } from '../../domain/ports/transaction.repository';
import { ChangeTransactionDto } from '../dto/change-transaction-status.dto';
import { ApproveTransactionResponseDto } from '../dto/approve-transaction-response.dto';
import {
  TransactionNotFoundError,
  TransactionAlreadyProcessedError,
  TransactionProductNotFoundError,
} from '../errors/transaction.errors';
import { Result, success, failure } from '../../../shared/result';
import { TransactionEntity } from '../../domain/entities/transaction.entity';
import { RepositoryError } from '../../../shared/application/errors/application.errors';
import { ProductRepository } from '../../../product/domain/ports/product.repository';

export type ApproveTransactionErrorType =
  | TransactionNotFoundError
  | TransactionAlreadyProcessedError
  | RepositoryError;

@Injectable()
export class ApproveTransactionUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(
    approveDto: ChangeTransactionDto,
  ): Promise<
    Result<ApproveTransactionResponseDto, ApproveTransactionErrorType>
  > {
    try {
      const transaction = await this.validateTransactionExists(approveDto.id);
      if (transaction.isFailure()) return transaction;

      const pendingValidation = this.validateTransactionIsPending(
        transaction.value,
      );
      if (pendingValidation.isFailure()) return pendingValidation;

      const approvedTransaction = transaction.value.approve();
      const savedTransaction =
        await this.transactionRepository.update(approvedTransaction);

      const reduceProductStock = await this.reduceProductStock(
        transaction.value,
      );
      if (reduceProductStock.isFailure()) {
        return reduceProductStock;
      }
      return success(this.mapToResponseDto(savedTransaction));
    } catch (error) {
      console.error('Error approving transaction:', error);
      const message = error instanceof Error ? error.message : String(error);
      return failure(
        new RepositoryError(`Error approving transaction: ${message}`),
      );
    }
  }

  private async validateTransactionExists(transactionId: string) {
    const transaction =
      await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      return failure(new TransactionNotFoundError(transactionId));
    }

    return success(transaction);
  }

  private validateTransactionIsPending(transaction: TransactionEntity) {
    if (!transaction.isPending()) {
      return failure(
        new TransactionAlreadyProcessedError(
          transaction.id,
          transaction.status,
        ),
      );
    }

    return success(undefined);
  }

  private async reduceProductStock(transaction: TransactionEntity) {
    const product = await this.productRepository.findById(
      transaction.productId,
    );

    if (!product)
      return failure(
        new TransactionProductNotFoundError(transaction.productId),
      );

    const updatedProductStock = product.confirmReservation(
      transaction.productQuantity,
    );

    const updatedProduct =
      await this.productRepository.updateStock(updatedProductStock);
    if (!updatedProduct) {
      return failure(new RepositoryError('Failed to update product stock'));
    }

    return success(undefined);
  }

  private mapToResponseDto(
    transaction: TransactionEntity,
  ): ApproveTransactionResponseDto {
    return {
      transaction: {
        id: transaction.id,
        status: transaction.status,
      },
    };
  }
}
