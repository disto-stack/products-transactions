import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { PrismaProductRepositoryImpl } from './prisma-product.repository.impl';
import { ProductEntity } from '../../domain/entities/product.entity';

const prismaServiceMock = {
  product: {
    findUnique: jest.fn(),
    update: jest.fn(),
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
      deliveryPrice: 10000,
      taxPercentage: 19,
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
      expect(result?.deliveryPrice).toBe(mockPrismaProduct.deliveryPrice);
      expect(result?.taxPercentage).toBe(mockPrismaProduct.taxPercentage);
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

  describe('updateStock', () => {
    const productId = '123e4567-e89b-12d3-a456-426614174000';
    const productName = 'Adidas Shoes';
    const productDescription = 'New adidas shoes';
    const productPrice = 1000000;
    const productDeliveryPrice = 10000;
    const productTaxPercentage = 19;
    const productImage = 'https://example.com/image.jpg';
    const productCreatedAt = new Date('2024-01-15T10:00:00.000Z');
    const productUpdatedAt = new Date('2024-01-15T10:00:00.000Z');
    const stockQuantity = 50;
    const reservedStockQuantity = 10;
    const stockUpdatedAt = new Date('2024-01-15T10:00:00.000Z');

    const productEntity = ProductEntity.createWithStock(
      productId,
      productName,
      productDescription,
      productPrice,
      productDeliveryPrice,
      productTaxPercentage,
      productImage,
      stockQuantity,
      reservedStockQuantity,
    );

    it('should return Product when product stock was updated', async () => {
      const mockPrismaProduct = {
        id: productId,
        name: productName,
        description: productDescription,
        price: productPrice,
        deliveryPrice: productDeliveryPrice,
        taxPercentage: productTaxPercentage,
        image: productImage,
        createdAt: productCreatedAt,
        updatedAt: productUpdatedAt,
        stock: {
          productId: productId,
          quantity: stockQuantity,
          updatedAt: stockUpdatedAt,
          reserved: reservedStockQuantity,
        },
      };

      prismaServiceMock.product.update.mockResolvedValue(mockPrismaProduct);

      const result = await repository.updateStock(productEntity);

      expect(result).toBeInstanceOf(ProductEntity);
      expect(result?.id).toBe(mockPrismaProduct.id);
      expect(result?.name).toBe(mockPrismaProduct.name);
      expect(result?.description).toBe(mockPrismaProduct.description);
      expect(result?.price).toBe(mockPrismaProduct.price);
      expect(result?.deliveryPrice).toBe(mockPrismaProduct.deliveryPrice);
      expect(result?.taxPercentage).toBe(mockPrismaProduct.taxPercentage);
      expect(result?.createdAt).toEqual(mockPrismaProduct.createdAt);

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          stock: {
            update: {
              quantity: stockQuantity,
              reserved: reservedStockQuantity,
            },
          },
        },
        include: {
          stock: true,
        },
      });

      expect(prismaService.product.update).toHaveBeenCalledTimes(1);
    });

    it('should throw error when Prisma operation fails', async () => {
      const databaseError = new Error('Database connection failed');
      prismaServiceMock.product.update.mockRejectedValue(databaseError);

      await expect(repository.updateStock(productEntity)).rejects.toThrow(
        'Database connection failed',
      );

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          stock: {
            update: {
              quantity: stockQuantity,
              reserved: reservedStockQuantity,
            },
          },
        },
        include: {
          stock: true,
        },
      });
    });
  });
});
