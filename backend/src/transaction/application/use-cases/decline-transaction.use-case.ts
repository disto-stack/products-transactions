// src/transaction/application/use-cases/approve-transaction.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { TransactionRepository } from '../../domain/ports/transaction.repository';
import { ChangeTransactionDto } from '../dto/change-transaction-status.dto';
import {
  TransactionNotFoundError,
  TransactionAlreadyProcessedError,
} from '../errors/transaction.errors';
import { Result, success, failure } from '../../../shared/result';
import { TransactionEntity } from '../../domain/entities/transaction.entity';
import { RepositoryError } from '../../../shared/application/errors/application.errors';
import { DeclineTransactionResponseDto } from '../dto/decline-transaction-response.dto';

export type DeclineTransactionErrorType =
  | TransactionNotFoundError
  | TransactionAlreadyProcessedError
  | RepositoryError;

@Injectable()
export class DeclineTransactionUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(
    declineDto: ChangeTransactionDto,
  ): Promise<
    Result<DeclineTransactionResponseDto, DeclineTransactionErrorType>
  > {
    try {
      const transaction = await this.validateTransactionExists(declineDto.id);
      if (!transaction.isSuccess()) return transaction;

      const pendingValidation = this.validateTransactionIsPending(
        transaction.value,
      );
      if (!pendingValidation.isSuccess()) return pendingValidation;

      const declinedTransaction = transaction.value.decline();
      const savedTransaction =
        await this.transactionRepository.update(declinedTransaction);

      return success(this.mapToResponseDto(savedTransaction));
    } catch (error) {
      console.error('Error declining transaction:', error);
      const message = error instanceof Error ? error.message : String(error);
      return failure(
        new RepositoryError(`Error declining transaction: ${message}`),
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

  private mapToResponseDto(
    transaction: TransactionEntity,
  ): DeclineTransactionResponseDto {
    return {
      transaction: {
        id: transaction.id,
        status: transaction.status,
      },
    };
  }
}
