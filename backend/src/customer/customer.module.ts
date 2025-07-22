import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

import { CheckCustomerExistsUseCase } from './application/use-cases/check-customer-exists.use-case';

import { PrismaCustomerRepositoryImpl } from './infrastructure/adapters/prisma-customer.repository.impl';
import { CustomerController } from './infrastructure/controller/customer.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerController],
  providers: [
    CheckCustomerExistsUseCase,
    {
      provide: 'CustomerRepository',
      useClass: PrismaCustomerRepositoryImpl,
    },
  ],
})
export class CustomerModule {}
