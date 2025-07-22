import { Inject, Injectable } from '@nestjs/common';
import { DeliveryRepository } from '../../domain/ports/delivery.repository';
import { TransactionRepository } from '../../../transaction/domain/ports/transaction.repository';
import { CreateDeliveryDto } from '../dto/create-delivery.dto';
import { CreateDeliveryResponseDto } from '../dto/create-delivery-response.dto';
import { Result, success, failure } from '../../../shared/result';
import { DeliveryEntity } from '../../domain/entities/delivery.entity';
import {
  DeliveryAlreadyExistsError,
  DeliveryTransactionNotApprovedError,
  DeliveryTransactionNotFoundError,
} from '../errors/delivery.errors';
import { RepositoryError } from '../../../shared/application/errors/application.errors';

export type CreateDeliveryErrorType =
  | DeliveryTransactionNotFoundError
  | DeliveryTransactionNotApprovedError
  | DeliveryAlreadyExistsError
  | RepositoryError;

@Injectable()
export class CreateDeliveryUseCase {
  constructor(
    @Inject('DeliveryRepository')
    private readonly deliveryRepository: DeliveryRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(
    dto: CreateDeliveryDto,
  ): Promise<Result<CreateDeliveryResponseDto, CreateDeliveryErrorType>> {
    try {
      const transactionResult = await this.validateTransaction(
        dto.transactionId,
      );
      if (!transactionResult.isSuccess()) return transactionResult;

      const deliveryResult = await this.validateNoExistingDelivery(
        dto.transactionId,
      );
      if (!deliveryResult.isSuccess()) return deliveryResult;

      const delivery = this.buildDelivery(dto);
      const saved = await this.deliveryRepository.save(delivery);

      return success(this.mapToResponse(saved));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return failure(new RepositoryError(message));
    }
  }

  private async validateTransaction(transactionId: string) {
    const transaction =
      await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      return failure(new DeliveryTransactionNotFoundError(transactionId));
    }

    if (!transaction.isApproved()) {
      return failure(new DeliveryTransactionNotApprovedError(transactionId));
    }

    return success(transaction);
  }

  private async validateNoExistingDelivery(transactionId: string) {
    const existingDelivery =
      await this.deliveryRepository.findByTransactionId(transactionId);

    if (existingDelivery) {
      return failure(new DeliveryAlreadyExistsError(transactionId));
    }

    return success(undefined);
  }

  private buildDelivery(dto: CreateDeliveryDto): DeliveryEntity {
    return DeliveryEntity.create(
      dto.transactionId,
      dto.address,
      dto.city,
      dto.department,
    );
  }

  private mapToResponse(saved: DeliveryEntity): CreateDeliveryResponseDto {
    return {
      transactionId: saved.transactionId,
      address: saved.address,
      city: saved.city,
      department: saved.department,
      fullAddress: saved.getFullAddress(),
      createdAt: saved.createdAt,
    };
  }
}
