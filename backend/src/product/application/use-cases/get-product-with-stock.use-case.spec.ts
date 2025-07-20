import { Test, TestingModule } from '@nestjs/testing';
import { GetProductWithStockUseCase } from './get-product-with-stock.use-case';
import { ProductRepository } from '../../domain/ports/product.repository';
import { ProductEntity } from '../../domain/entities/product.entity';
import { StockEntity } from '../../domain/entities/stock.entity';
import { RepositoryError } from '../../../shared/errors/application.errors';
import { ProductNotFoundError } from '../errors/product.errors';

describe('GetProductWithStockUseCase', () => {
  let useCase: GetProductWithStockUseCase;
  let mockRepository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
    } as jest.Mocked<ProductRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductWithStockUseCase,
        {
          provide: 'ProductRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetProductWithStockUseCase>(
      GetProductWithStockUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('pipeline success scenarios', () => {
    it('should return success when product exists', async () => {
      const stockEntity = new StockEntity('product-test-id', 10);
      const productEntity = new ProductEntity(
        'product-test-id',
        'Nike shoes',
        'Test description',
        800000,
        null,
        stockEntity,
      );

      mockRepository.findById.mockResolvedValue(productEntity);

      const result = await useCase.execute({ id: 'product-test-id' });

      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);

      if (result.isSuccess()) {
        expect(result.value.id).toBe('product-test-id');
        expect(result.value.stock.quantity).toBe(10);
      }

      expect(mockRepository.findById).toHaveBeenCalledWith('product-test-id');
    });
  });

  describe('pipeline failure scenarios', () => {
    it('should handle database connection errors', async () => {
      const dbError = new Error('Connection timeout');
      mockRepository.findById.mockRejectedValue(dbError);

      const result = await useCase.execute({ id: 'product-test-id' });

      expect(result.isFailure()).toBe(true);
      expect(result.isSuccess()).toBe(false);

      if (result.isFailure()) {
        expect(result.error).toBeInstanceOf(RepositoryError);
        expect(result.error.type).toBe('REPOSITORY_ERROR');
        expect(result.error.message).toContain('Connection timeout');
        expect(result.error.message).toContain(
          'Error fetching product: Connection timeout',
        );
      }
    });

    it('should return success when product exists', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({ id: 'product-test-id' });

      expect(result.isSuccess()).toBe(false);
      expect(result.isFailure()).toBe(true);

      if (result.isFailure()) {
        expect(result.error).toBeInstanceOf(ProductNotFoundError);
        expect(result.error.type).toBe('NOT_FOUND_ERROR');
        expect(result.error.message).toContain(
          'Product with identifier product-test-id',
        );
      }
    });
  });

  describe('pipeline integration', () => {
    it('should not call map when product not found', async () => {
      const mapToResponseDto = jest.spyOn(useCase as any, 'mapToResponseDto');
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({ id: 'unexpected-id' });

      expect(result.isFailure()).toBe(true);
      expect(mapToResponseDto).not.toHaveBeenCalled();

      mapToResponseDto.mockRestore();
    });
  });
});
