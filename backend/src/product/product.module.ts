import { Module } from '@nestjs/common';
import { ProductController } from './infrastructure/controller/product.controller';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { PrismaProductRepositoryImpl } from './infrastructure/adapters/prisma-product.repository.impl';
import { GetProductWithStockUseCase } from './application/use-cases/get-product-with-stock.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [
    GetProductWithStockUseCase,
    {
      provide: 'ProductRepository',
      useClass: PrismaProductRepositoryImpl,
    },
  ],
})
export class ProductModule {}
