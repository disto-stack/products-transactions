import { Inject, Injectable } from '@nestjs/common';
import { CustomerRepository } from '../../../customer/domain/ports/customer.repository';
import { ProductRepository } from '../../../product/domain/ports/product.repository';
import { TransactionRepository } from '../../domain/ports/transaction.repository';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { failure, Result, success } from '../../../shared/result';
import { TransactionEntity } from '../../domain/entities/transaction.entity';
import {
  RepositoryError,
  UnexpectedError,
} from '../../../shared/application/errors/application.errors';
import { CreateTransactionResponseDto } from '../dto/create-transaction-response.dto';
import { ProductEntity } from '../../../product/domain/entities/product.entity';
import { fromNullable } from '../../../shared/result/result';
import {
  TransactionInsufficientStockError,
  TransactionProductNotFoundError,
} from '../errors/transaction.errors';
import { CustomerEntity } from '../../../customer/domain/entities/customer.entity';
import { IdGenerator } from '../../../shared/domain/ports/id-generator';

export type CreateTransactionErrorType =
  | TransactionProductNotFoundError
  | TransactionInsufficientStockError
  | RepositoryError
  | UnexpectedError;

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    @Inject('IdGenerator')
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(
    createDto: CreateTransactionDto,
  ): Promise<Result<CreateTransactionResponseDto, CreateTransactionErrorType>> {
    try {
      const productResult = await this.validateProduct(createDto.productId);
      if (productResult.isFailure()) return productResult;

      const stockResult = this.validateStock(
        productResult.value,
        createDto.productQuantity,
      );
      if (stockResult.isFailure()) return stockResult;

      const reservedProduct = productResult.value.reserve(
        createDto.productQuantity,
      );
      await this.productRepository.updateStock(reservedProduct);

      const customer = await this.upsertCustomer(createDto);

      const transaction = this.createTransaction(
        createDto,
        productResult.value,
        customer,
      );
      const savedTransaction =
        await this.transactionRepository.save(transaction);

      return success(
        this.mapToResponseDto(savedTransaction, productResult.value),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(error);

      return failure(
        new RepositoryError(`Error creating transaction: ${message}`),
      );
    }
  }

  private async validateProduct(productId: string) {
    const product = await this.productRepository.findById(productId);
    return fromNullable(
      product,
      () => new TransactionProductNotFoundError(productId),
    );
  }

  private validateStock(product: ProductEntity, quantity: number) {
    if (!product.canReserve(quantity)) {
      return failure(
        new TransactionInsufficientStockError(
          product.id,
          quantity,
          product.getAvailableStock(),
        ),
      );
    }
    return success(product);
  }

  private async upsertCustomer(
    createDto: CreateTransactionDto,
  ): Promise<CustomerEntity> {
    const { customerEmail, customerName, customerPhone } = createDto;

    const customerEntity = new CustomerEntity(
      this.idGenerator.generateId(),
      customerName,
      customerEmail,
      customerPhone,
    );

    return await this.customerRepository.upsert(customerEntity);
  }

  private createTransaction(
    dto: CreateTransactionDto,
    product: ProductEntity,
    customer: CustomerEntity,
  ): TransactionEntity {
    return TransactionEntity.create(
      this.idGenerator.generateId(),
      dto.productId,
      dto.productQuantity,
      product.getTotalAmount(dto.productQuantity),
      customer.id,
      dto.paymentMethod,
    );
  }

  private mapToResponseDto(
    transaction: TransactionEntity,
    product: ProductEntity,
  ): CreateTransactionResponseDto {
    return {
      id: transaction.id,
      status: transaction.status,
      productId: transaction.productId,
      productQuantity: transaction.productQuantity,
      pricing: {
        subtotal: product.getSubtotal(transaction.productQuantity),
        formattedSubtotal:
          product.getFormattedPrice() + ` x ${transaction.productQuantity}`,
        taxPercentage: product.taxPercentage,
        taxAmount: product.getTaxAmount(transaction.productQuantity),
        formattedTaxAmount: product.getFormattedTaxAmount(
          transaction.productQuantity,
        ),
        deliveryPrice: product.deliveryPrice,
        formattedDeliveryPrice: product.getFormattedDeliveryPrice(),
        totalAmount: transaction.totalAmount,
        formattedTotalAmount: product.getFormattedTotalAmount(
          transaction.productQuantity,
        ),
      },
      customerId: transaction.customerId,
      paymentMethod: transaction.paymentMethod,
      createdAt: transaction.createdAt,
    };
  }
}
