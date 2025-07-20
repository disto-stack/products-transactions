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
      productWithStock.stock.updatedAt,
    );

    const productEntity = new ProductEntity(
      productWithStock.id,
      productWithStock.name,
      productWithStock.description,
      productWithStock.price,
      productWithStock.image,
      stockEntity,
      productWithStock.createdAt,
    );

    return productEntity;
  }
}
