import { Injectable, Inject } from '@nestjs/common';

import { failure, Result } from '../../../shared/result';
import { ProductRepository } from '../../domain/ports/product.repository';
import { GetProductDto } from '../dto/get-product.dto';
import { ProductEntity } from '../../domain/entities/product.entity';
import {
  RepositoryError,
  UnexpectedError,
} from '../../../shared/application/errors/application.errors';
import { fromNullable } from '../../../shared/result/result';
import { GetProductResponseDto } from '../dto/get-product-response.dto';
import { ProductNotFoundError } from '../errors/product.errors';

export type GetProductErrorType =
  | RepositoryError
  | UnexpectedError
  | ProductNotFoundError;

@Injectable()
export class GetProductWithStockUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(
    getProductDto: GetProductDto,
  ): Promise<Result<GetProductResponseDto, GetProductErrorType>> {
    try {
      const product = await this.productRepository.findById(getProductDto.id);

      return fromNullable(
        product,
        () => new ProductNotFoundError(getProductDto.id),
      ).map((product) => this.mapToResponseDto(product));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return failure(new RepositoryError(`Error fetching product: ${message}`));
    }
  }

  private mapToResponseDto(product: ProductEntity): GetProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      formattedPrice: product.getFormattedPrice(),
      deliveryPrice: product.deliveryPrice,
      formattedDeliveryPrice: product.getFormattedDeliveryPrice(),
      taxPercentage: product.taxPercentage,
      image: product.image,
      hasImage: product.hasImage(),
      stock: {
        quantity: product.getAvailableStock(),
        available: product.isAvailable(),
        outOfStock: product.isOutOfStock(),
        lastUpdated: product.getStockInfo().lastUpdated.toISOString(),
      },
      createdAt: product.createdAt.toISOString(),
    };
  }
}
