import { CustomerEntity } from '../entities/customer.entity';

export interface CustomerRepository {
  findByEmail(id: string): Promise<CustomerEntity | null>;
}
