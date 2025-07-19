import { Injectable } from '@nestjs/common';
import { CustomerEntity } from '../../domain/entities/customer.entity';
import { CustomerRepository } from '../../domain/ports/customer.repository';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class PrismaCustomerRepositoryImpl implements CustomerRepository {
  constructor(private readonly prismaService: PrismaService) {}

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
