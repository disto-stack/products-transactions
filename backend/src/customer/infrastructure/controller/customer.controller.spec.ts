import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CheckCustomerExistsUseCase } from '../../application/use-cases/check-customer-exists.use-case';
import { CustomerEntity } from '../../domain/entities/customer.entity';
import { CheckCustomertExistsDto } from '../../application/dto/check-customer-exists.dto';

describe('CustomerController', () => {
  let controller: CustomerController;
  let mockCheckCustomerExistsUseCase: jest.Mocked<CheckCustomerExistsUseCase>;

  beforeEach(async () => {
    mockCheckCustomerExistsUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CheckCustomerExistsUseCase,
          useValue: mockCheckCustomerExistsUseCase,
        },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have CheckCustomerExistsUseCase injected', () => {
      expect(mockCheckCustomerExistsUseCase).toBeDefined();
    });
  });

  describe('checkExists', () => {
    const validDto: CheckCustomertExistsDto = {
      email: 'juan@example.com',
    };

    const mockCustomer = new CustomerEntity(
      '123e4567-e89b-12d3-a456-426614174000',
      'Juan Carlos',
      'juan@example.com',
      '+573001234567',
      new Date('2024-01-15T10:00:00.000Z'),
    );

    it('should return success response when customer exists', async () => {
      mockCheckCustomerExistsUseCase.execute.mockResolvedValue(mockCustomer);

      const result = await controller.checkExists(validDto);

      expect(result).toEqual({
        success: true,
        data: {
          exists: true,
          customer: mockCustomer,
        },
        message: 'Customer found',
      });

      expect(mockCheckCustomerExistsUseCase.execute).toHaveBeenCalledWith(
        validDto,
      );
      expect(mockCheckCustomerExistsUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return success response when customer does not exist', async () => {
      mockCheckCustomerExistsUseCase.execute.mockResolvedValue(null);

      const result = await controller.checkExists(validDto);

      expect(result).toEqual({
        success: true,
        data: {
          exists: false,
          customer: null,
        },
        message: 'Customer not found',
      });

      expect(mockCheckCustomerExistsUseCase.execute).toHaveBeenCalledWith(
        validDto,
      );
    });

    it('should throw HttpException when use case throws error', async () => {
      const errorMessage = 'Database connection failed';
      mockCheckCustomerExistsUseCase.execute.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.checkExists(validDto)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
      );

      expect(mockCheckCustomerExistsUseCase.execute).toHaveBeenCalledWith(
        validDto,
      );
    });

    it('should handle non-Error exceptions gracefully', async () => {
      mockCheckCustomerExistsUseCase.execute.mockRejectedValue('String error');

      await expect(controller.checkExists(validDto)).rejects.toThrow(
        new HttpException('Internal server error', HttpStatus.BAD_REQUEST),
      );
    });

    it('should handle Error instances correctly', async () => {
      const customError = new Error('Custom validation error');
      mockCheckCustomerExistsUseCase.execute.mockRejectedValue(customError);

      await expect(controller.checkExists(validDto)).rejects.toThrow(
        new HttpException('Custom validation error', HttpStatus.BAD_REQUEST),
      );
    });
  });
});
