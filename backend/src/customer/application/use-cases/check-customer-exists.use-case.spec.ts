import { Test, TestingModule } from '@nestjs/testing';
import { CheckCustomerExistsUseCase } from './check-customer-exists.use-case';
import { CustomerRepository } from '../../domain/ports/customer.repository';
import { CustomerEntity } from '../../domain/entities/customer.entity';
import { RepositoryError } from '../../../shared/application/errors/application.errors';

describe('CheckCustomerExistsUseCase', () => {
  let useCase: CheckCustomerExistsUseCase;
  let mockRepository: jest.Mocked<CustomerRepository>;

  beforeEach(async () => {
    mockRepository = {
      findByEmail: jest.fn(),
      upsert: jest.fn(),
    } as jest.Mocked<CustomerRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckCustomerExistsUseCase,
        {
          provide: 'CustomerRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CheckCustomerExistsUseCase>(
      CheckCustomerExistsUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('pipeline success scenarios', () => {
    it('should return success when customer exists', async () => {
      const customerEntity = new CustomerEntity(
        '123',
        'Juan Pérez',
        'juan@example.com',
        '3007304451',
        new Date(),
      );
      mockRepository.findByEmail.mockResolvedValue(customerEntity);

      const result = await useCase.execute({ email: 'JUAN@EXAMPLE.COM' });

      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);

      if (result.isSuccess()) {
        expect(result.value.exists).toBe(true);
        expect(result.value.customer?.email).toBe('juan@example.com');
      }

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        'juan@example.com',
      );
    });

    it('should return success when customer does not exist', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);

      const result = await useCase.execute({ email: 'noexiste@example.com' });

      expect(result.isSuccess()).toBe(true);

      if (result.isSuccess()) {
        expect(result.value.exists).toBe(false);
        expect(result.value.customer).toBe(null);
      }

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        'noexiste@example.com',
      );
    });

    it('should normalize email correctly', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);

      await useCase.execute({ email: '  JUAN@EXAMPLE.COM  ' });
      await useCase.execute({ email: 'Maria@COMPANY.com' });

      expect(mockRepository.findByEmail).toHaveBeenNthCalledWith(
        1,
        'juan@example.com',
      );
      expect(mockRepository.findByEmail).toHaveBeenNthCalledWith(
        2,
        'maria@company.com',
      );
    });
  });

  describe('pipeline failure scenarios', () => {
    it('should handle database connection errors', async () => {
      const dbError = new Error('Connection timeout');
      mockRepository.findByEmail.mockRejectedValue(dbError);

      const result = await useCase.execute({ email: 'juan@example.com' });

      expect(result.isFailure()).toBe(true);
      expect(result.isSuccess()).toBe(false);

      if (result.isFailure()) {
        expect(result.error).toBeInstanceOf(RepositoryError);
        expect(result.error.type).toBe('REPOSITORY_ERROR');
        expect(result.error.message).toContain('Connection timeout');
        expect(result.error.message).toContain('Error finding customer');
      }
    });

    it('should handle database query errors', async () => {
      const queryError = new Error('Invalid SQL query');
      mockRepository.findByEmail.mockRejectedValue(queryError);

      const result = await useCase.execute({ email: 'test@example.com' });

      expect(result.isFailure()).toBe(true);

      if (result.isFailure()) {
        expect(result.error.message).toContain('Invalid SQL query');
        expect(result.error.type).toBe('REPOSITORY_ERROR');
      }
    });
  });

  describe('pipeline integration', () => {
    it('should not call buildResponse when repository fails', async () => {
      const buildResponseSpy = jest.spyOn(useCase as any, 'buildResponse');
      mockRepository.findByEmail.mockRejectedValue(new Error('DB Error'));

      const result = await useCase.execute({ email: 'juan@example.com' });

      expect(result.isFailure()).toBe(true);
      expect(buildResponseSpy).not.toHaveBeenCalled();

      buildResponseSpy.mockRestore();
    });

    it('should call all pipeline steps when successful', async () => {
      const normalizeEmailSpy = jest.spyOn(useCase as any, 'normalizeEmail');
      const findCustomerSpy = jest.spyOn(useCase as any, 'findCustomerByEmail');
      const buildResponseSpy = jest.spyOn(useCase as any, 'buildResponse');

      const customerEntity = new CustomerEntity(
        '1',
        'Juan',
        'juan@example.com',
        '3007304451',
        new Date(),
      );
      mockRepository.findByEmail.mockResolvedValue(customerEntity);

      const result = await useCase.execute({ email: 'juan@example.com' });

      expect(result.isSuccess()).toBe(true);
      expect(normalizeEmailSpy).toHaveBeenCalledWith('juan@example.com');
      expect(findCustomerSpy).toHaveBeenCalledWith('juan@example.com');
      expect(buildResponseSpy).toHaveBeenCalledWith(customerEntity);

      normalizeEmailSpy.mockRestore();
      findCustomerSpy.mockRestore();
      buildResponseSpy.mockRestore();
    });
  });
});
