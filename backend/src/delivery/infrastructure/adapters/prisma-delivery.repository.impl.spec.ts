import { Test, TestingModule } from '@nestjs/testing';
import { PrismaDeliveryRepositoryImpl } from './prisma-delivery.repository.impl';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { DeliveryEntity } from '../../domain/entities/delivery.entity';

const prismaServiceMock = {
  delivery: {
    create: jest.fn(),
  },
};

describe('PrismaDeliveryRepositoryImpl', () => {
  let repository: PrismaDeliveryRepositoryImpl;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaDeliveryRepositoryImpl,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<PrismaDeliveryRepositoryImpl>(
      PrismaDeliveryRepositoryImpl,
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
      expect(prismaService.delivery.create).toBeDefined();
    });
  });

  describe('save', () => {
    const mockDeliveryEntity = new DeliveryEntity(
      'transaction-456',
      'Calle 123 #45-67',
      'Medellín',
      'Antioquia',
      new Date('2024-01-15T10:00:00.000Z'),
    );

    const mockPrismaDelivery = {
      transactionId: 'transaction-456',
      address: 'Calle 123 #45-67',
      city: 'Medellín',
      department: 'Antioquia',
      createdAt: new Date('2024-01-15T10:00:00.000Z'),
      updatedAt: new Date('2024-01-15T10:00:00.000Z'),
    };

    it('should create delivery and return DeliveryEntity', async () => {
      prismaServiceMock.delivery.create.mockResolvedValue(mockPrismaDelivery);

      const result = await repository.save(mockDeliveryEntity);

      expect(result).toBeInstanceOf(DeliveryEntity);
      expect(result.transactionId).toBe(mockDeliveryEntity.transactionId);
      expect(result.address).toBe(mockDeliveryEntity.address);
      expect(result.city).toBe(mockDeliveryEntity.city);
      expect(result.department).toBe(mockDeliveryEntity.department);
      expect(result.createdAt).toEqual(mockDeliveryEntity.createdAt);

      expect(prismaService.delivery.create).toHaveBeenCalledWith({
        data: {
          transactionId: mockDeliveryEntity.transactionId,
          address: mockDeliveryEntity.address,
          city: mockDeliveryEntity.city,
          department: mockDeliveryEntity.department,
          createdAt: mockDeliveryEntity.createdAt,
          updatedAt: mockDeliveryEntity.updatedAt,
        },
      });

      expect(prismaService.delivery.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error when Prisma create operation fails', async () => {
      const databaseError = new Error('Database connection failed');
      prismaServiceMock.delivery.create.mockRejectedValue(databaseError);

      await expect(repository.save(mockDeliveryEntity)).rejects.toThrow(
        'Database connection failed',
      );

      expect(prismaService.delivery.create).toHaveBeenCalledWith({
        data: {
          transactionId: mockDeliveryEntity.transactionId,
          address: mockDeliveryEntity.address,
          city: mockDeliveryEntity.city,
          department: mockDeliveryEntity.department,
          createdAt: mockDeliveryEntity.createdAt,
          updatedAt: mockDeliveryEntity.updatedAt,
        },
      });
    });
  });
});
