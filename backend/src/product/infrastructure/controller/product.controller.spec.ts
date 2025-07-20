import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { success, failure } from '../../../shared/result';
import {
  RepositoryError,
  BusinessRuleError,
  UnexpectedError,
} from '../../../shared/errors/application.errors';
import { ProductController } from './product.controller';
import { GetProductWithStockUseCase } from '../../application/use-cases/get-product-with-stock.use-case';
import { GetProductResponseDto } from '../../application/dto/get-product-response.dto';
import { ProductNotFoundError } from '../../application/errors/product.errors';

describe('ProductController', () => {
  let controller: ProductController;
  let mockUseCase: jest.Mocked<GetProductWithStockUseCase>;

  beforeEach(async () => {
    mockUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: GetProductWithStockUseCase,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductWithStock - success cases', () => {
    it('should return success response when customer exists', async () => {
      const productResponseDto: GetProductResponseDto = {
        id: 'product-test-id',
        name: 'Nike shoes',
        description: 'Test description',
        price: 800000,
        formattedPrice: '',
        image: null,
        hasImage: false,
        stock: {
          quantity: 10,
          available: true,
          outOfStock: false,
          lastUpdated: '2024-01-01T00:00:00.000Z',
        },
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      mockUseCase.execute.mockResolvedValue(success(productResponseDto));

      const result = await controller.getProduct({
        id: 'product-test-id',
      });

      expect(result).toEqual({
        success: true,
        data: {
          product: productResponseDto,
        },
      });

      expect(mockUseCase.execute).toHaveBeenCalledWith({
        id: 'product-test-id',
      });
      expect(mockUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProductWithStock - error cases', () => {
    it('should throw NotFoundException for business rule errors', async () => {
      const notFoundError = new ProductNotFoundError('product-test-id');
      mockUseCase.execute.mockResolvedValue(failure(notFoundError));

      await expect(controller.getProduct({ id: 'product-id' })).rejects.toThrow(
        NotFoundException,
      );

      try {
        await controller.getProduct({ id: 'product-id' });
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'NOT_FOUND_ERROR',
            message: 'Product with identifier product-test-id not found',
          },
        });
      }
    });

    it('should throw InternalServerErrorException for repository errors', async () => {
      const repositoryError = new RepositoryError('Database connection failed');
      mockUseCase.execute.mockResolvedValue(failure(repositoryError));

      await expect(controller.getProduct({ id: 'id-test' })).rejects.toThrow(
        InternalServerErrorException,
      );

      try {
        await controller.getProduct({ id: 'id-test' });
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

        expect(error.response.error.message).not.toContain(
          'Database connection failed',
        );
        expect(error.response.error.message).not.toContain('repository');
        expect(error.response.error.message).not.toContain('SQL');
      }
    });

    it('should throw InternalServerErrorException for unexpected errors', async () => {
      const unexpectedError = new UnexpectedError('Something went wrong');
      mockUseCase.execute.mockResolvedValue(failure(unexpectedError));

      await expect(controller.getProduct({ id: 'id-test' })).rejects.toThrow(
        InternalServerErrorException,
      );

      try {
        await controller.getProduct({ id: 'id-test' });
        fail('Should have thrown InternalServerErrorException');
      } catch (error) {
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
          },
        });
      }
    });
  });
});
