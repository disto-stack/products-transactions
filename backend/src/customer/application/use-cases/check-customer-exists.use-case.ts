import { Injectable, Inject } from '@nestjs/common';
import { CustomerEntity } from '../../domain/entities/customer.entity';
import { CustomerRepository } from '../../domain/ports/customer.repository';
import { CheckCustomertExistsDto } from '../dto/check-customer-exists.dto';
import { failure, Result, success } from '../../../shared/result';
import { CustomerDto } from '../dto/customer-response.dto';
import { CheckCustomerExistsResponseDto } from '../dto/check-customer-exists-response.dto';
import {
  BusinessRuleError,
  RepositoryError,
  UnexpectedError,
} from '../../../shared/application/errors/application.errors';

export type CheckCustomerErrorType =
  | BusinessRuleError
  | RepositoryError
  | UnexpectedError;

@Injectable()
export class CheckCustomerExistsUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(
    checkDto: CheckCustomertExistsDto,
  ): Promise<Result<CheckCustomerExistsResponseDto, CheckCustomerErrorType>> {
    return this.normalizeEmail(checkDto.email)
      .bindAsync((email) => this.findCustomerByEmail(email))
      .then((result) => result.map((customer) => this.buildResponse(customer)));
  }

  private normalizeEmail(email: string): Result<string, never> {
    const normalized = email.toLowerCase().trim();
    return success(normalized);
  }

  private async findCustomerByEmail(
    email: string,
  ): Promise<Result<CustomerEntity | null, RepositoryError>> {
    try {
      const customer = await this.customerRepository.findByEmail(email);
      return success(customer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return failure(new RepositoryError(`Error finding customer: ${message}`));
    }
  }

  private buildResponse(
    customer: CustomerEntity | null,
  ): CheckCustomerExistsResponseDto {
    return {
      exists: !!customer,
      customer: customer ? this.mapEntityToDto(customer) : null,
    };
  }

  private mapEntityToDto(customer: CustomerEntity): CustomerDto {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      createdAt: customer.createdAt.toISOString(),
    };
  }
}
