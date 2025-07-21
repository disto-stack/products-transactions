import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { ProductRepository } from '../../domain/ports/product.repository';
import { ProductEntity } from '../../domain/entities/product.entity';
import { StockEntity } from '../../domain/entities/stock.entity';

@Injectable()
export class PrismaProductRepositoryImpl implements ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<ProductEntity | null> {
    const productWithStock = await this.prismaService.product.findUnique({
      where: { id },
      include: {
        stock: true,
      },
    });

    if (!productWithStock || !productWithStock.stock) {
      return null;
    }

    const stockEntity = new StockEntity(
      productWithStock.stock.productId,
      productWithStock.stock.quantity,
      productWithStock.stock.reserved,
      productWithStock.stock.updatedAt,
    );

    const productEntity = new ProductEntity(
      productWithStock.id,
      productWithStock.name,
      productWithStock.description,
      productWithStock.price,
      productWithStock.deliveryPrice,
      productWithStock.taxPercentage,
      productWithStock.image,
      stockEntity,
      productWithStock.createdAt,
    );

    return productEntity;
  }

  async updateStock(product: ProductEntity): Promise<ProductEntity> {
    const updatedProduct = await this.prismaService.product.update({
      where: { id: product.id },
      data: {
        stock: {
          update: {
            quantity: product.getStockQuantity(),
            reserved: product.getReservedQuantity(),
          },
        },
      },
      include: {
        stock: true,
      },
    });

    const { stock } = updatedProduct;

    if (!updatedProduct || !stock) {
      throw new Error('Failed to update product stock');
    }

    const stockEntity = new StockEntity(
      stock.productId,
      stock.quantity,
      stock.reserved,
      stock.updatedAt,
    );

    return new ProductEntity(
      updatedProduct.id,
      updatedProduct.name,
      updatedProduct.description,
      updatedProduct.price,
      updatedProduct.deliveryPrice,
      updatedProduct.taxPercentage,
      updatedProduct.image,
      stockEntity,
      updatedProduct.createdAt,
    );
  }
}
