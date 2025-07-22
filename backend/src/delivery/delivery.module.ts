import { Module } from '@nestjs/common';
import { DeliveryController } from './infrastructure/controller/delivery.controller';
import { PrismaDeliveryRepositoryImpl } from './infrastructure/adapters/prisma-delivery.repository.impl';
import { PrismaTransactionRepositoryImpl } from '../transaction/infrastructure/adapters/prisma-transaction.repository.impl';
import { CreateDeliveryUseCase } from './application/use-cases/create-delivery.use-case';
import { PrismaModule } from '../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeliveryController],
  providers: [
    CreateDeliveryUseCase,

    {
      provide: 'DeliveryRepository',
      useClass: PrismaDeliveryRepositoryImpl,
    },
    {
      provide: 'TransactionRepository',
      useClass: PrismaTransactionRepositoryImpl,
    },
  ],
})
export class DeliveryModule {}
