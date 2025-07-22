import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CheckCustomerExistsUseCase } from '../../application/use-cases/check-customer-exists.use-case';
import { success, failure } from '../../../shared/result';
import {
  RepositoryError,
  BusinessRuleError,
  UnexpectedError,
} from '../../../shared/application/errors/application.errors';
import { CheckCustomerExistsResponseDto } from 'src/customer/application/dto/check-customer-exists-response.dto';

describe('CustomerController', () => {
  let controller: CustomerController;
  let mockUseCase: jest.Mocked<CheckCustomerExistsUseCase>;

  beforeEach(async () => {
    mockUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CheckCustomerExistsUseCase,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkCustomerExists - success cases', () => {
    it('should return success response when customer exists', async () => {
      const customerDto = {
        id: '123',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const responseDto: CheckCustomerExistsResponseDto = {
        exists: true,
        customer: customerDto,
      };

      mockUseCase.execute.mockResolvedValue(success(responseDto));

      const result = await controller.checkCustomerExists({
        email: 'juan@example.com',
      });

      expect(result).toEqual({
        success: true,
        data: {
          exists: true,
          customer: customerDto,
        },
      });

      expect(mockUseCase.execute).toHaveBeenCalledWith({
        email: 'juan@example.com',
      });
      expect(mockUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return success response when customer does not exist', async () => {
      const responseDto: CheckCustomerExistsResponseDto = {
        exists: false,
        customer: null,
      };

      mockUseCase.execute.mockResolvedValue(success(responseDto));

      const result = await controller.checkCustomerExists({
        email: 'noexiste@example.com',
      });

      expect(result).toEqual({
        success: true,
        data: {
          exists: false,
          customer: null,
        },
      });

      expect(mockUseCase.execute).toHaveBeenCalledWith({
        email: 'noexiste@example.com',
      });
    });
  });

  describe('checkCustomerExists - error cases', () => {
    it('should throw BadRequestException for business rule errors', async () => {
      const businessError = new BusinessRuleError('Invalid email format');
      mockUseCase.execute.mockResolvedValue(failure(businessError));

      await expect(
        controller.checkCustomerExists({ email: 'invalid-email' }),
      ).rejects.toThrow(BadRequestException);

      try {
        await controller.checkCustomerExists({ email: 'invalid-email' });
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'BUSINESS_RULE_ERROR',
            message: 'Invalid email format',
          },
        });
      }
    });

    it('should throw InternalServerErrorException for repository errors', async () => {
      const repositoryError = new RepositoryError('Database connection failed');
      mockUseCase.execute.mockResolvedValue(failure(repositoryError));

      await expect(
        controller.checkCustomerExists({ email: 'juan@example.com' }),
      ).rejects.toThrow(InternalServerErrorException);

      try {
        await controller.checkCustomerExists({ email: 'juan@example.com' });
        fail('Should have thrown InternalServerErrorException');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'INTERNAL_ERROR',
            message: 'An internal error occurred while processing your request',
          },
        });
      }
    });

    it('should throw InternalServerErrorException for unexpected errors', async () => {
      const unexpectedError = new UnexpectedError('Something went wrong');
      mockUseCase.execute.mockResolvedValue(failure(unexpectedError));

      await expect(
        controller.checkCustomerExists({ email: 'juan@example.com' }),
      ).rejects.toThrow(InternalServerErrorException);

      try {
        await controller.checkCustomerExists({ email: 'juan@example.com' });
        fail('Should have thrown InternalServerErrorException');
      } catch (error) {
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
          },
        });
      }
    });
  });
});
