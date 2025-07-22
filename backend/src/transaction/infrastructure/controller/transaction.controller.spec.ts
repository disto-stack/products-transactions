import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { success, failure } from '../../../shared/result';
import {
  RepositoryError,
  UnexpectedError,
} from '../../../shared/application/errors/application.errors';
import { TransactionController } from './transaction.controller';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { CreateTransactionResponseDto } from '../../application/dto/create-transaction-response.dto';
import {
  CreateTransactionDto,
  PaymentMethod,
} from '../../application/dto/create-transaction.dto';
import {
  TransactionProductNotFoundError,
  TransactionInsufficientStockError,
  TransactionNotFoundError,
  TransactionAlreadyProcessedError,
} from '../../application/errors/transaction.errors';
import { ApproveTransactionUseCase } from '../../application/use-cases/approve-transaction.use-case';
import { ApproveTransactionResponseDto } from '../../application/dto/approve-transaction-response.dto';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { ChangeTransactionDto } from '../../application/dto/change-transaction-status.dto';
import { DeclineTransactionUseCase } from '../../application/use-cases/decline-transaction.use-case';
import { DeclineTransactionResponseDto } from '../../application/dto/decline-transaction-response.dto';

describe('TransactionController', () => {
  let controller: TransactionController;
  let mockCreateTransactionUseCase: jest.Mocked<CreateTransactionUseCase>;
  let mockApproveTransactionUseCase: jest.Mocked<ApproveTransactionUseCase>;
  let mockDeclineTransactionUseCase: jest.Mocked<DeclineTransactionUseCase>;

  beforeEach(async () => {
    mockCreateTransactionUseCase = {
      execute: jest.fn(),
    } as any;

    mockApproveTransactionUseCase = {
      execute: jest.fn(),
    } as any;

    mockDeclineTransactionUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: CreateTransactionUseCase,
          useValue: mockCreateTransactionUseCase,
        },
        {
          provide: ApproveTransactionUseCase,
          useValue: mockApproveTransactionUseCase,
        },
        {
          provide: DeclineTransactionUseCase,
          useValue: mockDeclineTransactionUseCase,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction - success cases', () => {
    it('should return success response when transaction is created', async () => {
      const createTransactionDto: CreateTransactionDto = {
        productId: 'product-test-id',
        productQuantity: 2,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        customerEmail: 'juan@example.com',
        customerPhone: '3007304451',
        customerName: 'Juan Perez',
      };

      const transactionResponseDto: CreateTransactionResponseDto = {
        id: 'txn_1703123456789_abc123def',
        status: 'PENDING',
        productId: 'product-test-id',
        productQuantity: 2,
        pricing: {
          subtotal: 3000000,
          formattedSubtotal: '$1.500.000 x 2',
          taxPercentage: 19,
          taxAmount: 570000,
          formattedTaxAmount: '$570.000',
          deliveryPrice: 25000,
          formattedDeliveryPrice: '$25.000',
          totalAmount: 3595000,
          formattedTotalAmount: '$3.595.000',
        },
        customerId: 'customer-test-id',
        paymentMethod: 'CREDIT_CARD',
        createdAt: new Date('2024-01-15T10:30:00.000Z'),
      };

      mockCreateTransactionUseCase.execute.mockResolvedValue(
        success(transactionResponseDto),
      );

      const result = await controller.createTransaction(createTransactionDto);

      expect(result).toEqual({
        success: true,
        data: {
          transaction: transactionResponseDto,
        },
      });

      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledWith(
        createTransactionDto,
      );
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle different payment methods', async () => {
      const createTransactionDto: CreateTransactionDto = {
        productId: 'product-test-id',
        productQuantity: 2,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        customerEmail: 'juan@example.com',
        customerPhone: '3007304451',
        customerName: 'Juan Perez',
      };

      const transactionResponseDto: CreateTransactionResponseDto = {
        id: 'txn_1703123456789_def456ghi',
        status: 'PENDING',
        productId: 'product-test-id',
        productQuantity: 1,
        pricing: {
          subtotal: 1500000,
          formattedSubtotal: '$1.500.000 x 1',
          taxPercentage: 19,
          taxAmount: 285000,
          formattedTaxAmount: '$285.000',
          deliveryPrice: 25000,
          formattedDeliveryPrice: '$25.000',
          totalAmount: 1810000,
          formattedTotalAmount: '$1.810.000',
        },
        customerId: 'customer-test-id',
        paymentMethod: 'PSE',
        createdAt: new Date('2024-01-15T10:30:00.000Z'),
      };

      mockCreateTransactionUseCase.execute.mockResolvedValue(
        success(transactionResponseDto),
      );

      const result = await controller.createTransaction(createTransactionDto);

      expect(result.success).toBe(true);
      expect(
        (result.data.transaction as CreateTransactionResponseDto).paymentMethod,
      ).toBe('PSE');
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledWith(
        createTransactionDto,
      );
    });
  });

  describe('createTransaction - error cases', () => {
    it('should throw NotFoundException for product not found errors', async () => {
      const createTransactionDto: CreateTransactionDto = {
        productId: 'non-existent-product',
        productQuantity: 1,
        customerEmail: 'juan@example.com',
        customerPhone: '3007304451',
        customerName: 'Juan Perez',
        paymentMethod: PaymentMethod.DEBIT_CARD,
      };

      const productNotFoundError = new TransactionProductNotFoundError(
        'non-existent-product',
      );
      mockCreateTransactionUseCase.execute.mockResolvedValue(
        failure(productNotFoundError),
      );

      await expect(
        controller.createTransaction(createTransactionDto),
      ).rejects.toThrow(NotFoundException);

      try {
        await controller.createTransaction(createTransactionDto);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'PRODUCT_NOT_FOUND',
            message: 'Product with identifier non-existent-product not found',
          },
        });
      }
    });

    it('should throw BadRequestException for insufficient stock errors', async () => {
      const createTransactionDto: CreateTransactionDto = {
        productId: 'product-test-id',
        productQuantity: 10,
        customerEmail: 'juan@example.com',
        customerPhone: '3007304451',
        customerName: 'Juan Perez',
        paymentMethod: PaymentMethod.PSE,
      };

      const insufficientStockError = new TransactionInsufficientStockError(
        'product-test-id',
        10,
        5,
      );
      mockCreateTransactionUseCase.execute.mockResolvedValue(
        failure(insufficientStockError),
      );

      await expect(
        controller.createTransaction(createTransactionDto),
      ).rejects.toThrow(BadRequestException);

      try {
        await controller.createTransaction(createTransactionDto);
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'INSUFFICIENT_STOCK',
            message:
              'Product product-test-id has insufficient stock: requested 10, available 5',
          },
        });
      }
    });

    it('should throw InternalServerErrorException for repository errors', async () => {
      const createTransactionDto: CreateTransactionDto = {
        productId: 'product-test-id',
        productQuantity: 1,
        customerEmail: 'juan@example.com',
        customerPhone: '3007304451',
        customerName: 'Juan Perez',
        paymentMethod: PaymentMethod.CREDIT_CARD,
      };

      const repositoryError = new RepositoryError('Database connection failed');
      mockCreateTransactionUseCase.execute.mockResolvedValue(
        failure(repositoryError),
      );

      await expect(
        controller.createTransaction(createTransactionDto),
      ).rejects.toThrow(InternalServerErrorException);

      try {
        await controller.createTransaction(createTransactionDto);
        fail('Should have thrown InternalServerErrorException');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'INTERNAL_ERROR',
            message: 'An internal error occurred while processing your request',
          },
        });
      }
    });

    it('should throw InternalServerErrorException for unexpected errors', async () => {
      const createTransactionDto: CreateTransactionDto = {
        productId: 'product-test-id',
        productQuantity: 1,
        customerEmail: 'juan@example.com',
        customerPhone: '3007304451',
        customerName: 'Juan Perez',
        paymentMethod: PaymentMethod.CREDIT_CARD,
      };

      const unexpectedError = new UnexpectedError('Something went wrong');
      mockCreateTransactionUseCase.execute.mockResolvedValue(
        failure(unexpectedError),
      );

      await expect(
        controller.createTransaction(createTransactionDto),
      ).rejects.toThrow(InternalServerErrorException);

      try {
        await controller.createTransaction(createTransactionDto);
        fail('Should have thrown InternalServerErrorException');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
          },
        });

        expect(error.response.error.message).not.toContain(
          'Something went wrong',
        );
      }
    });
  });

  describe('approveTransaction - success cases', () => {
    it('should return success response when transaction is approved', async () => {
      const approveTransactionDto: ChangeTransactionDto = {
        id: 'transaction_id',
      };

      const transactionResponseDto: ApproveTransactionResponseDto = {
        transaction: {
          id: 'transaction_id',
          status: TransactionStatus.APPROVED,
        },
      };

      mockApproveTransactionUseCase.execute.mockResolvedValue(
        success(transactionResponseDto),
      );

      const result = await controller.approveTransaction(approveTransactionDto);

      expect(result).toEqual({
        success: true,
        data: {
          transaction: transactionResponseDto,
        },
      });

      expect(mockApproveTransactionUseCase.execute).toHaveBeenCalledWith(
        approveTransactionDto,
      );
      expect(mockApproveTransactionUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('approveTransaction - error cases', () => {
    it('should throw NotFoundException for transaction not found errors', async () => {
      const approveTransactionDto: ChangeTransactionDto = {
        id: 'transaction_id',
      };

      const transactionNotFoundError = new TransactionNotFoundError(
        'non-existent-transaction',
      );
      mockApproveTransactionUseCase.execute.mockResolvedValue(
        failure(transactionNotFoundError),
      );

      await expect(
        controller.approveTransaction(approveTransactionDto),
      ).rejects.toThrow(NotFoundException);

      try {
        await controller.approveTransaction(approveTransactionDto);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'TRANSACTION_NOT_FOUND',
            message:
              'Transaction with identifier non-existent-transaction not found',
          },
        });
      }
    });

    it('should throw BadRequestException for already processed', async () => {
      const approveTransactionDto: ChangeTransactionDto = {
        id: 'transaction_id',
      };

      const transactionAlreadyProcessedError =
        new TransactionAlreadyProcessedError(
          'already-processed-transaction',
          'APPROVED',
        );
      mockApproveTransactionUseCase.execute.mockResolvedValue(
        failure(transactionAlreadyProcessedError),
      );

      await expect(
        controller.approveTransaction(approveTransactionDto),
      ).rejects.toThrow(BadRequestException);

      try {
        await controller.approveTransaction(approveTransactionDto);
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'ALREADY_PROCESSED',
            message:
              'Transaction already-processed-transaction is already processed with status: APPROVED',
          },
        });
      }
    });
  });

  describe('declineTransaction - success cases', () => {
    it('should return success response when transaction is declined', async () => {
      const declineTransactionDto: ChangeTransactionDto = {
        id: 'transaction_id',
      };

      const transactionResponseDto: DeclineTransactionResponseDto = {
        transaction: {
          id: 'transaction_id',
          status: TransactionStatus.DECLINED,
        },
      };

      mockDeclineTransactionUseCase.execute.mockResolvedValue(
        success(transactionResponseDto),
      );

      const result = await controller.declineTransaction(declineTransactionDto);

      expect(result).toEqual({
        success: true,
        data: {
          transaction: transactionResponseDto,
        },
      });

      expect(mockDeclineTransactionUseCase.execute).toHaveBeenCalledWith(
        declineTransactionDto,
      );
      expect(mockDeclineTransactionUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('approveTransaction - error cases', () => {
    it('should throw NotFoundException for transaction not found errors', async () => {
      const declineTransactionDto: ChangeTransactionDto = {
        id: 'transaction_id',
      };

      const transactionNotFoundError = new TransactionNotFoundError(
        'non-existent-transaction',
      );
      mockDeclineTransactionUseCase.execute.mockResolvedValue(
        failure(transactionNotFoundError),
      );

      await expect(
        controller.declineTransaction(declineTransactionDto),
      ).rejects.toThrow(NotFoundException);

      try {
        await controller.declineTransaction(declineTransactionDto);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'TRANSACTION_NOT_FOUND',
            message:
              'Transaction with identifier non-existent-transaction not found',
          },
        });
      }
    });

    it('should throw BadRequestException for already processed', async () => {
      const declineTransactionDto: ChangeTransactionDto = {
        id: 'transaction_id',
      };

      const transactionAlreadyProcessedError =
        new TransactionAlreadyProcessedError(
          'non-existent-transaction',
          'DECLINED',
        );
      mockDeclineTransactionUseCase.execute.mockResolvedValue(
        failure(transactionAlreadyProcessedError),
      );

      await expect(
        controller.declineTransaction(declineTransactionDto),
      ).rejects.toThrow(BadRequestException);

      try {
        await controller.declineTransaction(declineTransactionDto);
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'ALREADY_PROCESSED',
            message:
              'Transaction non-existent-transaction is already processed with status: DECLINED',
          },
        });
      }
    });
  });
});
