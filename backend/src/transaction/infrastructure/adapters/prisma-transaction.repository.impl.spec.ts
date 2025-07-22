import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { PrismaTransactionRepositoryImpl } from './prisma-transaction.repository.impl';
import { TransactionEntity } from '../../domain/entities/transaction.entity';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

const prismaServiceMock = {
  transaction: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('PrismaTransactionRepositoryImpl', () => {
  let repository: PrismaTransactionRepositoryImpl;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaTransactionRepositoryImpl,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<PrismaTransactionRepositoryImpl>(
      PrismaTransactionRepositoryImpl,
    );
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('dependency injection', () => {
    it('should be defined', () => {
      expect(repository).toBeDefined();
    });

    it('should have PrismaService injected', () => {
      expect(prismaService.transaction.create).toBeDefined();
    });
  });

  describe('save', () => {
    const transactionId = 'txn_1703123456789_abc123def';
    const productId = 'product-test-id';
    const customerId = 'customer-test-id';
    const productQuantity = 2;
    const totalAmount = 3595000;
    const paymentMethod = PaymentMethod.CREDIT_CARD;
    const status = 'PENDING';
    const createdAt = new Date('2024-01-15T10:30:00.000Z');

    const transactionEntity = TransactionEntity.create(
      transactionId,
      productId,
      productQuantity,
      totalAmount,
      customerId,
      paymentMethod,
    );

    const mockPrismaTransaction = {
      id: transactionId,
      status: status,
      productId: productId,
      productQuantity: productQuantity,
      totalAmount: totalAmount,
      customerId: customerId,
      paymentMethod: paymentMethod,
      createdAt: createdAt,
      updatedAt: createdAt,
    };

    it('should return Transaction when transaction is saved successfully', async () => {
      prismaServiceMock.transaction.create.mockResolvedValue(
        mockPrismaTransaction,
      );

      const result = await repository.save(transactionEntity);

      expect(result).toBeInstanceOf(TransactionEntity);
      expect(result.id).toBe(mockPrismaTransaction.id);
      expect(result.status).toBe(mockPrismaTransaction.status);
      expect(result.productId).toBe(mockPrismaTransaction.productId);
      expect(result.productQuantity).toBe(
        mockPrismaTransaction.productQuantity,
      );
      expect(result.totalAmount).toBe(mockPrismaTransaction.totalAmount);
      expect(result.customerId).toBe(mockPrismaTransaction.customerId);
      expect(result.paymentMethod).toBe(mockPrismaTransaction.paymentMethod);

      expect(prismaService.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id: transactionId,
            status: status,
            productId: productId,
            productQuantity: productQuantity,
            totalAmount: totalAmount,
            customerId: customerId,
            paymentMethod: paymentMethod,
          }),
        }),
      );

      expect(prismaService.transaction.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error when Prisma operation fails', async () => {
      const databaseError = new Error('Database connection failed');
      prismaServiceMock.transaction.create.mockRejectedValue(databaseError);

      await expect(repository.save(transactionEntity)).rejects.toThrow(
        'Database connection failed',
      );

      expect(prismaService.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id: transactionId,
            status: status,
            productId: productId,
            productQuantity: productQuantity,
            totalAmount: totalAmount,
            customerId: customerId,
            paymentMethod: paymentMethod,
          }),
        }),
      );
    });
  });

  describe('update', () => {
    const transactionId = 'txn_1703123456789_abc123def';
    const productId = 'product-test-id';
    const customerId = 'customer-test-id';
    const productQuantity = 2;
    const totalAmount = 3595000;
    const paymentMethod = PaymentMethod.CREDIT_CARD;
    const status = 'PENDING';
    const createdAt = new Date('2024-01-15T10:30:00.000Z');

    const transactionEntity = TransactionEntity.create(
      transactionId,
      productId,
      productQuantity,
      totalAmount,
      customerId,
      paymentMethod,
    );

    const mockPrismaTransaction = {
      id: transactionId,
      status: status,
      productId: productId,
      productQuantity: productQuantity,
      totalAmount: totalAmount,
      customerId: customerId,
      paymentMethod: paymentMethod,
      createdAt: createdAt,
      updatedAt: createdAt,
    };

    it('should return Transaction when transaction is updated successfully', async () => {
      prismaServiceMock.transaction.update.mockResolvedValue(
        mockPrismaTransaction,
      );

      const result = await repository.update(transactionEntity);

      expect(result).toBeInstanceOf(TransactionEntity);
      expect(result.id).toBe(mockPrismaTransaction.id);
      expect(result.status).toBe(mockPrismaTransaction.status);
      expect(result.productId).toBe(mockPrismaTransaction.productId);
      expect(result.productQuantity).toBe(
        mockPrismaTransaction.productQuantity,
      );
      expect(result.totalAmount).toBe(mockPrismaTransaction.totalAmount);
      expect(result.customerId).toBe(mockPrismaTransaction.customerId);
      expect(result.paymentMethod).toBe(mockPrismaTransaction.paymentMethod);

      expect(prismaService.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: transactionId },
          data: expect.objectContaining({
            status: status,
            productId: productId,
            productQuantity: productQuantity,
            totalAmount: totalAmount,
            customerId: customerId,
            paymentMethod: paymentMethod,
          }),
        }),
      );

      expect(prismaService.transaction.update).toHaveBeenCalledTimes(1);
    });

    it('should throw error when Prisma operation fails', async () => {
      const databaseError = new Error('Database connection failed');
      prismaServiceMock.transaction.update.mockRejectedValue(databaseError);

      await expect(repository.update(transactionEntity)).rejects.toThrow(
        'Database connection failed',
      );

      expect(prismaService.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: transactionId },
          data: expect.objectContaining({
            status: status,
            productId: productId,
            productQuantity: productQuantity,
            totalAmount: totalAmount,
            customerId: customerId,
            paymentMethod: paymentMethod,
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    const transactionId = 'txn_1703123456789_abc123def';
    const productId = 'product-test-id';
    const customerId = 'customer-test-id';
    const productQuantity = 2;
    const totalAmount = 3595000;
    const paymentMethod = PaymentMethod.CREDIT_CARD;
    const status = 'PENDING';
    const createdAt = new Date('2024-01-15T10:30:00.000Z');

    const mockPrismaTransaction = {
      id: transactionId,
      status: status,
      productId: productId,
      productQuantity: productQuantity,
      totalAmount: totalAmount,
      customerId: customerId,
      paymentMethod: paymentMethod,
      createdAt: createdAt,
      updatedAt: createdAt,
    };

    it('should return Transaction when transaction is found', async () => {
      prismaServiceMock.transaction.findUnique.mockResolvedValue(
        mockPrismaTransaction,
      );

      const result = await repository.findById(transactionId);

      expect(result).toBeInstanceOf(TransactionEntity);
      expect(result?.id).toBe(mockPrismaTransaction.id);
      expect(result?.status).toBe(mockPrismaTransaction.status);
      expect(result?.productId).toBe(mockPrismaTransaction.productId);
      expect(result?.productQuantity).toBe(
        mockPrismaTransaction.productQuantity,
      );
      expect(result?.totalAmount).toBe(mockPrismaTransaction.totalAmount);
      expect(result?.customerId).toBe(mockPrismaTransaction.customerId);
      expect(result?.paymentMethod).toBe(mockPrismaTransaction.paymentMethod);

      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: transactionId },
      });

      expect(prismaService.transaction.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null when transaction is not found', async () => {
      prismaServiceMock.transaction.findUnique.mockResolvedValue(null);

      const result = await repository.findById(transactionId);
      expect(result).toBeNull();

      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: transactionId },
      });

      expect(prismaService.transaction.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
