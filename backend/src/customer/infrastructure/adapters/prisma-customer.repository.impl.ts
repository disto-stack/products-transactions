import { Injectable } from '@nestjs/common';
import { CustomerEntity } from '../../domain/entities/customer.entity';
import { CustomerRepository } from '../../domain/ports/customer.repository';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class PrismaCustomerRepositoryImpl implements CustomerRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async upsert(customer: CustomerEntity): Promise<CustomerEntity> {
    const upsertedCustomer = await this.prismaService.customer.upsert({
      where: { email: customer.email },
      update: {
        name: customer.name,
        phone: customer.phone,
        updatedAt: new Date(),
      },
      create: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
    });

    return new CustomerEntity(
      upsertedCustomer.id,
      upsertedCustomer.name,
      upsertedCustomer.email,
      upsertedCustomer.phone,
      upsertedCustomer.createdAt,
      upsertedCustomer.updatedAt,
    );
  }

  async findByEmail(email: string): Promise<CustomerEntity | null> {
    const customer = await this.prismaService.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      return null;
    }

    return new CustomerEntity(
      customer.id,
      customer.name,
      customer.email,
      customer.phone,
      customer.createdAt,
      customer.updatedAt,
    );
  }
}
