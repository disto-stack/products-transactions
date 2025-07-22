import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from './create-transaction.use-case';
import { TransactionRepository } from '../../domain/ports/transaction.repository';
import { ProductRepository } from '../../../product/domain/ports/product.repository';
import { CustomerRepository } from '../../../customer/domain/ports/customer.repository';
import {
  CreateTransactionDto,
  PaymentMethod,
} from '../dto/create-transaction.dto';
import { CreateTransactionResponseDto } from '../dto/create-transaction-response.dto';
import { TransactionEntity } from '../../domain/entities/transaction.entity';
import { ProductEntity } from '../../../product/domain/entities/product.entity';
import { CustomerEntity } from '../../../customer/domain/entities/customer.entity';
import { StockEntity } from '../../../product/domain/entities/stock.entity';
import {
  TransactionProductNotFoundError,
  TransactionInsufficientStockError,
} from '../errors/transaction.errors';
import { RepositoryError } from '../../../shared/application/errors/application.errors';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { IdGenerator } from '../../../shared/domain/ports/id-generator';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;
  let mockProductRepository: jest.Mocked<ProductRepository>;
  let mockCustomerRepository: jest.Mocked<CustomerRepository>;
  let mockIdGenerator: jest.Mocked<IdGenerator>;

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

    mockCustomerRepository = {
      upsert: jest.fn(),
      findByEmail: jest.fn(),
    };

    mockIdGenerator = {
      generateId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        {
          provide: 'TransactionRepository',
          useValue: mockTransactionRepository,
        },
        {
          provide: 'ProductRepository',
          useValue: mockProductRepository,
        },
        {
          provide: 'CustomerRepository',
          useValue: mockCustomerRepository,
        },
        {
          provide: 'IdGenerator',
          useValue: mockIdGenerator,
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('dependency injection', () => {
    it('should be defined', () => {
      expect(useCase).toBeDefined();
    });

    it('should have all repositories injected', () => {
      expect(mockTransactionRepository).toBeDefined();
      expect(mockProductRepository).toBeDefined();
      expect(mockCustomerRepository).toBeDefined();
    });
  });

  describe('execute - success cases', () => {
    const createTransactionDto: CreateTransactionDto = {
      productId: 'product-test-id',
      productQuantity: 2,
      customerEmail: 'juan@example.com',
      customerPhone: '3007304451',
      customerName: 'Juan Perez',
      paymentMethod: PaymentMethod.CREDIT_CARD,
    };

    const mockCustomer = new CustomerEntity(
      'customer-test-id',
      'Juan Perez',
      'juan@example.com',
      '3007304451',
      new Date('2024-01-01T00:00:00.000Z'),
    );

    const mockStock = new StockEntity(
      'product-test-id',
      10,
      0,
      new Date('2024-01-15T10:00:00.000Z'),
    );

    const mockProduct = new ProductEntity(
      'product-test-id',
      'Gaming Laptop',
      'High performance gaming laptop',
      1500000,
      25000,
      19,
      'https://example.com/laptop.jpg',
      mockStock,
      new Date('2024-01-01T00:00:00.000Z'),
    );

    const mockSavedTransaction = new TransactionEntity(
      'txn_1703123456789_abc123def',
      TransactionStatus.PENDING,
      'product-test-id',
      2,
      3595000,
      'customer-test-id',
      PaymentMethod.CREDIT_CARD,
      new Date('2024-01-15T10:30:00.000Z'),
    );

    it('should create transaction successfully when all validations pass', async () => {
      mockCustomerRepository.upsert.mockResolvedValue(mockCustomer);
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.updateStock.mockResolvedValue(mockProduct);
      mockTransactionRepository.save.mockResolvedValue(mockSavedTransaction);

      const result = await useCase.execute(createTransactionDto);

      expect(result.isSuccess()).toBe(true);
      expect(result.value).toEqual(
        expect.objectContaining({
          id: 'txn_1703123456789_abc123def',
          status: 'PENDING',
          productId: 'product-test-id',
          productQuantity: 2,
          customerId: 'customer-test-id',
          paymentMethod: 'CREDIT_CARD',
          pricing: expect.objectContaining({
            subtotal: 3000000,
            formattedSubtotal: expect.stringContaining('x 2'),
            taxPercentage: 19,
            taxAmount: 570000,
            deliveryPrice: 25000,
            totalAmount: 3595000,
          }),
        }),
      );

      expect(mockCustomerRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'juan@example.com',
        }),
      );
      expect(mockProductRepository.findById).toHaveBeenCalledWith(
        'product-test-id',
      );
      expect(mockProductRepository.updateStock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'product-test-id',
        }),
      );
      expect(mockTransactionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'product-test-id',
          productQuantity: 2,
          customerId: 'customer-test-id',
          paymentMethod: 'CREDIT_CARD',
        }),
      );

      expect(mockCustomerRepository.upsert).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.updateStock).toHaveBeenCalledTimes(1);
      expect(mockTransactionRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('execute - validation error cases', () => {
    const createTransactionDto: CreateTransactionDto = {
      productId: 'product-test-id',
      productQuantity: 2,
      customerPhone: '3007304451',
      customerName: 'Juan Perez',
      customerEmail: 'juan@example.com',
      paymentMethod: PaymentMethod.CREDIT_CARD,
    };

    it('should fail when product does not exist', async () => {
      const mockCustomer = new CustomerEntity(
        'customer-test-id',
        'Juan Perez',
        'juan@example.com',
        '3007304451',
        new Date('2024-01-01T00:00:00.000Z'),
      );

      mockCustomerRepository.upsert.mockResolvedValue(mockCustomer);
      mockProductRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(createTransactionDto);

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(TransactionProductNotFoundError);
      expect(result.error.message).toBe(
        'Product with identifier product-test-id not found',
      );

      expect(mockProductRepository.findById).toHaveBeenCalledWith(
        'product-test-id',
      );
      expect(mockCustomerRepository.upsert).not.toHaveBeenCalled();
      expect(mockTransactionRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when product has insufficient stock', async () => {
      const mockCustomer = new CustomerEntity(
        'customer-test-id',
        'Juan Perez',
        'juan@example.com',
        '3007304451',
        new Date('2024-01-01T00:00:00.000Z'),
      );

      const insufficientStock = new StockEntity(
        'product-test-id',
        1,
        0,
        new Date('2024-01-15T10:00:00.000Z'),
      );

      const mockProduct = new ProductEntity(
        'product-test-id',
        'Gaming Laptop',
        'High performance gaming laptop',
        1500000,
        25000,
        19,
        'https://example.com/laptop.jpg',
        insufficientStock,
        new Date('2024-01-01T00:00:00.000Z'),
      );

      mockCustomerRepository.upsert.mockResolvedValue(mockCustomer);
      mockProductRepository.findById.mockResolvedValue(mockProduct);

      const result = await useCase.execute(createTransactionDto);

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(TransactionInsufficientStockError);
      expect(result.error.message).toBe(
        'Product product-test-id has insufficient stock: requested 2, available 1',
      );

      expect(mockProductRepository.findById).toHaveBeenCalledWith(
        'product-test-id',
      );
      expect(mockCustomerRepository.upsert).not.toHaveBeenCalled();
      expect(mockProductRepository.updateStock).not.toHaveBeenCalled();
      expect(mockTransactionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('execute - repository error cases', () => {
    const createTransactionDto: CreateTransactionDto = {
      productId: 'product-test-id',
      productQuantity: 2,
      customerName: 'Juan Perez',
      customerPhone: '3007304451',
      customerEmail: 'juan@example.com',
      paymentMethod: PaymentMethod.CREDIT_CARD,
    };

    it('should fail when product repository throws error on findById', async () => {
      const mockCustomer = new CustomerEntity(
        'customer-test-id',
        'Juan Perez',
        'juan@example.com',
        '3007304451',
        new Date('2024-01-01T00:00:00.000Z'),
      );

      const databaseError = new Error('Product table is locked');
      mockCustomerRepository.upsert.mockResolvedValue(mockCustomer);
      mockProductRepository.findById.mockRejectedValue(databaseError);

      const result = await useCase.execute(createTransactionDto);

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(RepositoryError);
      expect(result.error.message).toContain('Error creating transaction');
      expect(result.error.message).toContain('Product table is locked');
    });

    it('should fail when product repository throws error on updateStock', async () => {
      const mockCustomer = new CustomerEntity(
        'customer-test-id',
        'Juan Perez',
        'juan@example.com',
        '3007304451',
        new Date('2024-01-01T00:00:00.000Z'),
      );

      const mockStock = new StockEntity(
        'product-test-id',
        10,
        0,
        new Date('2024-01-15T10:00:00.000Z'),
      );

      const mockProduct = new ProductEntity(
        'product-test-id',
        'Gaming Laptop',
        'High performance gaming laptop',
        1500000,
        25000,
        19,
        'https://example.com/laptop.jpg',
        mockStock,
        new Date('2024-01-01T00:00:00.000Z'),
      );

      const updateError = new Error('Stock update failed');
      mockCustomerRepository.upsert.mockResolvedValue(mockCustomer);
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.updateStock.mockRejectedValue(updateError);

      const result = await useCase.execute(createTransactionDto);

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(RepositoryError);
      expect(result.error.message).toContain('Error creating transaction');
      expect(result.error.message).toContain('Stock update failed');

      expect(mockTransactionRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when customer repository throws error', async () => {
      const mockStock = new StockEntity(
        'product-test-id',
        10,
        0,
        new Date('2024-01-15T10:00:00.000Z'),
      );

      const mockProduct = new ProductEntity(
        'product-test-id',
        'Gaming Laptop',
        'High performance gaming laptop',
        1500000,
        25000,
        19,
        'https://example.com/laptop.jpg',
        mockStock,
        new Date('2024-01-01T00:00:00.000Z'),
      );

      const saveError = new Error('Customer save failed');
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.updateStock.mockResolvedValue(mockProduct);
      mockCustomerRepository.upsert.mockRejectedValue(saveError);

      const result = await useCase.execute(createTransactionDto);

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(RepositoryError);
      expect(result.error.message).toContain('Error creating transaction');
      expect(result.error.message).toContain('Customer save failed');

      expect(mockCustomerRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'juan@example.com',
        }),
      );
    });

    it('should fail when transaction repository throws error on save', async () => {
      const mockCustomer = new CustomerEntity(
        'customer-test-id',
        'Juan Perez',
        'juan@example.com',
        '3007304451',
        new Date('2024-01-01T00:00:00.000Z'),
      );

      const mockStock = new StockEntity(
        'product-test-id',
        10,
        0,
        new Date('2024-01-15T10:00:00.000Z'),
      );

      const mockProduct = new ProductEntity(
        'product-test-id',
        'Gaming Laptop',
        'High performance gaming laptop',
        1500000,
        25000,
        19,
        'https://example.com/laptop.jpg',
        mockStock,
        new Date('2024-01-01T00:00:00.000Z'),
      );

      const saveError = new Error('Transaction save failed');
      mockCustomerRepository.upsert.mockResolvedValue(mockCustomer);
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.updateStock.mockResolvedValue(mockProduct);
      mockTransactionRepository.save.mockRejectedValue(saveError);

      const result = await useCase.execute(createTransactionDto);

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(RepositoryError);
      expect(result.error.message).toContain('Error creating transaction');
      expect(result.error.message).toContain('Transaction save failed');
    });
  });
});
