import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './customer/customer.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [CustomerModule, PrismaModule, ProductModule, TransactionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
