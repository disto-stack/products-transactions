import { Module } from '@nestjs/common';
import { TransactionController } from './infrastructure/controller/transaction.controller';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { PrismaTransactionRepositoryImpl } from './infrastructure/adapters/prisma-transaction.repository.impl';
import { PrismaProductRepositoryImpl } from '../product/infrastructure/adapters/prisma-product.repository.impl';
import { PrismaCustomerRepositoryImpl } from '../customer/infrastructure/adapters/prisma-customer.repository.impl';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { UuidIdGenerator } from '../shared/infrastructure/adapters/uuid-id-generator';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionController],
  providers: [
    CreateTransactionUseCase,
    {
      provide: 'TransactionRepository',
      useClass: PrismaTransactionRepositoryImpl,
    },
    {
      provide: 'ProductRepository',
      useClass: PrismaProductRepositoryImpl,
    },
    {
      provide: 'CustomerRepository',
      useClass: PrismaCustomerRepositoryImpl,
    },
    {
      provide: 'IdGenerator',
      useClass: UuidIdGenerator,
    },
  ],
})
export class TransactionModule {}
