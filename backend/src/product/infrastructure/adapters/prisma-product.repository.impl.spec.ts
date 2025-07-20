import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { PrismaProductRepositoryImpl } from './prisma-product.repository.impl';
import { ProductEntity } from '../../domain/entities/product.entity';

const prismaServiceMock = {
  product: {
    findUnique: jest.fn(),
  },
};

describe('PrismaProductRepositoryImpl', () => {
  let repository: PrismaProductRepositoryImpl;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaProductRepositoryImpl,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<PrismaProductRepositoryImpl>(
      PrismaProductRepositoryImpl,
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
      expect(prismaService.product.findUnique).toBeDefined();
    });
  });

  describe('findByEmail', () => {
    const testId = 'id-test';
    const mockPrismaProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Adidas Shoes',
      description: 'New adidas shoes',
      price: 1000000,
      image: 'https://example.com/image.jpg',
      createdAt: new Date('2024-01-15T10:00:00.000Z'),
      updatedAt: new Date('2024-01-15T10:00:00.000Z'),
      stock: {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 50,
        updatedAt: new Date('2024-01-15T10:00:00.000Z'),
      },
    };

    it('should return Product when product exists', async () => {
      prismaServiceMock.product.findUnique.mockResolvedValue(mockPrismaProduct);

      const result = await repository.findById(testId);

      expect(result).toBeInstanceOf(ProductEntity);
      expect(result?.id).toBe(mockPrismaProduct.id);
      expect(result?.name).toBe(mockPrismaProduct.name);
      expect(result?.description).toBe(mockPrismaProduct.description);
      expect(result?.price).toBe(mockPrismaProduct.price);
      expect(result?.createdAt).toEqual(mockPrismaProduct.createdAt);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: testId },
        include: {
          stock: true,
        },
      });

      expect(prismaService.product.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null when the product does not exist', async () => {
      prismaServiceMock.product.findUnique.mockResolvedValue(null);

      const result = await repository.findById(testId);

      expect(result).toBeNull();
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: testId },
        include: {
          stock: true,
        },
      });
    });

    it('should throw error when Prisma operation fails', async () => {
      const databaseError = new Error('Database connection failed');
      prismaServiceMock.product.findUnique.mockRejectedValue(databaseError);

      await expect(repository.findById(testId)).rejects.toThrow(
        'Database connection failed',
      );

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: testId },
        include: {
          stock: true,
        },
      });
    });
  });
});
