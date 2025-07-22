import { Test, TestingModule } from '@nestjs/testing';
import { PrismaCustomerRepositoryImpl } from './prisma-customer.repository.impl';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CustomerEntity } from '../../domain/entities/customer.entity';

const prismaServiceMock = {
  customer: {
    findUnique: jest.fn()
  },
};

describe('PrismaCustomerRepositoryImpl', () => {
  let repository: PrismaCustomerRepositoryImpl;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaCustomerRepositoryImpl,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<PrismaCustomerRepositoryImpl>(PrismaCustomerRepositoryImpl);
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
      expect(prismaService.customer.findUnique).toBeDefined();
    });
  });

  describe('findByEmail', () => {
    const testEmail = 'juan@example.com';
    const mockPrismaCustomer = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Juan Carlos',
      email: 'juan@example.com',
      phone: '+573001234567',
      createdAt: new Date('2024-01-15T10:00:00.000Z'),
      updatedAt: new Date('2024-01-15T10:00:00.000Z'),
    };

    it('should return CustomerEntity when customer exists', async () => {
      prismaServiceMock.customer.findUnique.mockResolvedValue(mockPrismaCustomer);

      const result = await repository.findByEmail(testEmail);

      expect(result).toBeInstanceOf(CustomerEntity);
      expect(result?.id).toBe(mockPrismaCustomer.id);
      expect(result?.name).toBe(mockPrismaCustomer.name);
      expect(result?.email).toBe(mockPrismaCustomer.email);
      expect(result?.phone).toBe(mockPrismaCustomer.phone);
      expect(result?.createdAt).toEqual(mockPrismaCustomer.createdAt);
      expect(result?.updatedAt).toEqual(mockPrismaCustomer.updatedAt);

      expect(prismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { email: testEmail },
      });

      expect(prismaService.customer.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null when customer does not exist', async () => {
      prismaServiceMock.customer.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail(testEmail);

      expect(result).toBeNull();
      expect(prismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { email: testEmail },
      });
    });

    it('should throw error when Prisma operation fails', async () => {
      const databaseError = new Error('Database connection failed');
      prismaServiceMock.customer.findUnique.mockRejectedValue(databaseError);

      await expect(repository.findByEmail(testEmail)).rejects.toThrow(
        'Database connection failed',
      );

      expect(prismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { email: testEmail },
      });
    });
  });
});