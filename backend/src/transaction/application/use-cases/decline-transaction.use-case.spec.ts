import { Test, TestingModule } from '@nestjs/testing';
import { DeclineTransactionUseCase } from './decline-transaction.use-case';
import { TransactionRepository } from '../../domain/ports/transaction.repository';
import { ChangeTransactionDto } from '../dto/change-transaction-status.dto';
import { TransactionEntity } from '../../domain/entities/transaction.entity';
import {
  TransactionNotFoundError,
  TransactionAlreadyProcessedError,
} from '../errors/transaction.errors';
import { RepositoryError } from '../../../shared/application/errors/application.errors';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { PaymentMethod } from '../dto/create-transaction.dto';
import { ProductRepository } from '../../../product/domain/ports/product.repository';
import { StockEntity } from '../../../product/domain/entities/stock.entity';
import { ProductEntity } from '../../../product/domain/entities/product.entity';

describe('DeclineTransactionUseCase', () => {
  let useCase: DeclineTransactionUseCase;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;
  let mockProductRepository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    mockTransactionRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
    };

    mockProductRepository = {
      findById: jest.fn(),
      updateStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeclineTransactionUseCase,
        {
          provide: 'TransactionRepository',
          useValue: mockTransactionRepository,
        },
        {
          provide: 'ProductRepository',
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeclineTransactionUseCase>(DeclineTransactionUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('dependency injection', () => {
    it('should be defined', () => {
      expect(useCase).toBeDefined();
    });

    it('should have transaction repository injected', () => {
      expect(mockTransactionRepository).toBeDefined();
      expect(mockTransactionRepository.findById).toBeDefined();
      expect(mockTransactionRepository.update).toBeDefined();
    });
  });

  describe('execute - success cases', () => {
    const ChangeTransactionDto: ChangeTransactionDto = {
      id: 'transaction_id',
    };

    const mockPendingTransaction = new TransactionEntity(
      'transaction_id',
      TransactionStatus.PENDING,
      'product-test-id',
      2,
      3595000,
      'customer-test-id',
      PaymentMethod.CREDIT_CARD,
      new Date('2024-01-15T10:30:00.000Z'),
    );

    const mockDeclinedTransaction = new TransactionEntity(
      'transaction_id',
      TransactionStatus.DECLINED,
      'product-test-id',
      2,
      3595000,
      'customer-test-id',
      PaymentMethod.CREDIT_CARD,
      new Date('2024-01-15T10:30:00.000Z'),
      new Date('2024-01-15T11:00:00.000Z'),
    );

    const mockStock = new StockEntity('product-test-id', 10, 5);

    const mockProduct = new ProductEntity(
      'product-test-id',
      'Test Product',
      'Test Description',
      10000,
      20000,
      19,
      null,
      mockStock,
    );

    it('should approve transaction successfully when transaction is pending', async () => {
      mockTransactionRepository.findById.mockResolvedValue(
        mockPendingTransaction,
      );
      mockTransactionRepository.update.mockResolvedValue(
        mockDeclinedTransaction,
      );

      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.updateStock.mockResolvedValue(mockProduct);

      const result = await useCase.execute(ChangeTransactionDto);

      expect(result.isSuccess()).toBe(true);
      expect(result.value).toEqual({
        transaction: {
          id: 'transaction_id',
          status: TransactionStatus.DECLINED,
        },
      });

      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(
        'transaction_id',
      );
      expect(mockTransactionRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'transaction_id',
          status: TransactionStatus.DECLINED,
          productId: 'product-test-id',
          productQuantity: 2,
          totalAmount: 3595000,
          customerId: 'customer-test-id',
          paymentMethod: PaymentMethod.CREDIT_CARD,
        }),
      );

      expect(mockProductRepository.findById).toHaveBeenCalledWith(
        'product-test-id',
      );

      expect(mockProductRepository.updateStock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'product-test-id',
          stock: expect.objectContaining({
            quantity: 10,
            reserved: 3,
          }),
        }),
      );

      expect(mockTransactionRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockTransactionRepository.update).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.updateStock).toHaveBeenCalledTimes(1);
    });
  });

  describe('execute - validation error cases', () => {
    const ChangeTransactionDto: ChangeTransactionDto = {
      id: 'transaction_nonexistent',
    };

    it('should fail when transaction does not exist', async () => {
      mockTransactionRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(ChangeTransactionDto);

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(TransactionNotFoundError);
      expect(result.error.message).toBe(
        'Transaction with identifier transaction_nonexistent not found',
      );

      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(
        'transaction_nonexistent',
      );
      expect(mockTransactionRepository.update).not.toHaveBeenCalled();
    });

    it('should fail when transaction is already declined', async () => {
      const declinedTransaction = new TransactionEntity(
        'transaction_declined',
        TransactionStatus.DECLINED,
        'product-test-id',
        2,
        3595000,
        'customer-test-id',
        PaymentMethod.CREDIT_CARD,
        new Date('2024-01-15T10:30:00.000Z'),
        new Date('2024-01-15T10:45:00.000Z'),
      );

      mockTransactionRepository.findById.mockResolvedValue(declinedTransaction);

      const result = await useCase.execute({ id: 'transaction_declined' });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(TransactionAlreadyProcessedError);
      expect(result.error.message).toBe(
        'Transaction transaction_declined is already processed with status: DECLINED',
      );

      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(
        'transaction_declined',
      );
      expect(mockTransactionRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('execute - repository error cases', () => {
    const ChangeTransactionDto: ChangeTransactionDto = {
      id: 'transaction_repository_error',
    };

    it('should fail when transaction repository throws error on findById', async () => {
      const databaseError = new Error('Database connection failed');
      mockTransactionRepository.findById.mockRejectedValue(databaseError);

      const result = await useCase.execute(ChangeTransactionDto);

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(RepositoryError);
      expect(result.error.message).toContain('Error declining transaction');
      expect(result.error.message).toContain('Database connection failed');

      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(
        'transaction_repository_error',
      );
      expect(mockTransactionRepository.update).not.toHaveBeenCalled();
    });

    it('should fail when transaction repository throws error on update', async () => {
      const mockPendingTransaction = new TransactionEntity(
        'transaction_update_error',
        TransactionStatus.PENDING,
        'product-test-id',
        2,
        3595000,
        'customer-test-id',
        PaymentMethod.CREDIT_CARD,
        new Date('2024-01-15T10:30:00.000Z'),
      );

      const updateError = new Error('Transaction update failed');
      mockTransactionRepository.findById.mockResolvedValue(
        mockPendingTransaction,
      );
      mockTransactionRepository.update.mockRejectedValue(updateError);

      const result = await useCase.execute({ id: 'transaction_update_error' });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(RepositoryError);
      expect(result.error.message).toContain('Error declining transaction');
      expect(result.error.message).toContain('Transaction update failed');

      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(
        'transaction_update_error',
      );
      expect(mockTransactionRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'transaction_update_error',
          status: TransactionStatus.DECLINED,
        }),
      );
    });
  });
});
