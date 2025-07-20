import {
  Controller,
  Get,
  Param,
  NotFoundException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  GetProductErrorType,
  GetProductWithStockUseCase,
} from '../../application/use-cases/get-product-with-stock.use-case';
import { GetProductDto } from '../../application/dto/get-product.dto';
import { GetProductResponseDto } from '../../application/dto/get-product-response.dto';
import { RepositoryError } from '../../../shared/errors/application.errors';
import { ProductNotFoundError } from '../../application/errors/product.errors';

interface ProductSuccessResponse {
  success: boolean;
  data: {
    product: GetProductResponseDto;
  };
}

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly getProductWithStockUseCase: GetProductWithStockUseCase,
  ) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get product with stock information',
    description:
      'Retrieves a product by ID including its current stock information',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: '123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '123' },
            name: { type: 'string', example: 'Laptop Gaming' },
            description: {
              type: 'string',
              example: 'High performance laptop for gaming',
            },
            price: { type: 'number', example: 1500000 },
            formattedPrice: { type: 'string', example: '$1.500.000' },
            image: {
              type: 'string',
              example: 'https://example.com/laptop.jpg',
              nullable: true,
            },
            hasImage: { type: 'boolean', example: true },
            stock: {
              type: 'object',
              properties: {
                quantity: { type: 'number', example: 15 },
                available: { type: 'boolean', example: true },
                outOfStock: { type: 'boolean', example: false },
                lastUpdated: {
                  type: 'string',
                  example: '2024-01-01T10:00:00.000Z',
                },
              },
            },
            createdAt: { type: 'string', example: '2024-01-01T08:00:00.000Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          properties: {
            type: { type: 'string', example: 'PRODUCT_NOT_FOUND' },
            message: {
              type: 'string',
              example: 'Product with identifier 123 not found',
            },
            timestamp: { type: 'string', example: '2024-01-01T00:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          properties: {
            type: { type: 'string', example: 'INTERNAL_ERROR' },
            message: {
              type: 'string',
              example:
                'An internal error occurred while processing your request',
            },
            timestamp: { type: 'string', example: '2024-01-01T00:00:00Z' },
          },
        },
      },
    },
  })
  async getProduct(
    @Param() getProductDto: GetProductDto,
  ): Promise<ProductSuccessResponse> {
    const result = await this.getProductWithStockUseCase.execute(getProductDto);

    if (result.isFailure()) {
      this.handleError(result.error);
    }

    return {
      success: true,
      data: {
        product: result.value,
      },
    };
  }

  private handleError(error: GetProductErrorType): never {
    if (error instanceof ProductNotFoundError) {
      throw new NotFoundException({
        success: false,
        error: {
          type: error.type,
          message: error.message,
        },
      });
    }

    if (error instanceof RepositoryError) {
      throw new InternalServerErrorException({
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          message: 'An internal error occurred while processing your request',
        },
      });
    }

    throw new InternalServerErrorException({
      success: false,
      error: {
        type: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
}
