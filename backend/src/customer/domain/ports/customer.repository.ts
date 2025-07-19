import { CustomerEntity } from "../entities/customer.entity";

export interface CustomerRepository {
  findById(id: string): Promise<CustomerEntity | null>;
  save(customer: CustomerEntity): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<CustomerEntity[]>;
} 