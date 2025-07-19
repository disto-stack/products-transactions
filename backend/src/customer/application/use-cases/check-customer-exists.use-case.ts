import { Injectable, Inject } from '@nestjs/common';
import { CustomerEntity } from '../../domain/entities/customer.entity';
import { CustomerRepository } from '../../domain/ports/customer.repository';
import { CheckCustomertExistsDto } from '../dto/check-customer-exists.dto';

@Injectable()
export class CheckCustomerExistsUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(
    checkDto: CheckCustomertExistsDto,
  ): Promise<CustomerEntity | null> {
    const { email } = checkDto;

    try {
      const customer = await this.customerRepository.findByEmail(
        email.toLowerCase().trim(),
      );

      return customer;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(`Failed to check customer: ${error.message}`);
    }
  }
}
