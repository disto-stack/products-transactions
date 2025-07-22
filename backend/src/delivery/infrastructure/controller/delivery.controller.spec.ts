import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryController } from './delivery.controller';
import { CreateDeliveryUseCase } from '../../application/use-cases/create-delivery.use-case';
import { CreateDeliveryDto } from '../../application/dto/create-delivery.dto';
import { CreateDeliveryResponseDto } from '../../application/dto/create-delivery-response.dto';
import {
  DeliveryTransactionNotFoundError,
  DeliveryTransactionNotApprovedError,
  DeliveryAlreadyExistsError,
} from '../../application/errors/delivery.errors';
import { RepositoryError } from '../../../shared/application/errors/application.errors';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { success, failure } from '../../../shared/result';

describe('DeliveryController', () => {
  let controller: DeliveryController;
  let createDeliveryUseCase: jest.Mocked<CreateDeliveryUseCase>;

  beforeEach(async () => {
    createDeliveryUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [
        { provide: CreateDeliveryUseCase, useValue: createDeliveryUseCase },
      ],
    }).compile();

    controller = module.get<DeliveryController>(DeliveryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDelivery - success cases', () => {
    const dto: CreateDeliveryDto = {
      transactionId: 'transaction_1',
      address: 'Calle 123',
      city: 'Medellín',
      department: 'Antioquia',
    };

    const deliveryResponse: CreateDeliveryResponseDto = {
      transactionId: 'transaction_1',
      address: 'Calle 123',
      city: 'Medellín',
      department: 'Antioquia',
      fullAddress: 'Calle 123, Medellín, Antioquia',
      createdAt: new Date('2024-01-01T10:00:00.000Z'),
    };

    it('should return success response when delivery is created', async () => {
      createDeliveryUseCase.execute.mockResolvedValue(
        success(deliveryResponse),
      );

      const result = await controller.createDelivery(dto);

      expect(result).toEqual({
        success: true,
        data: { delivery: deliveryResponse },
      });
      expect(createDeliveryUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('createDelivery - error cases', () => {
    const dto: CreateDeliveryDto = {
      transactionId: 'transaction_1',
      address: 'Calle 123',
      city: 'Medellín',
      department: 'Antioquia',
    };

    it('should throw NotFoundException if transaction not found', async () => {
      createDeliveryUseCase.execute.mockResolvedValue(
        failure(new DeliveryTransactionNotFoundError('transaction_1')),
      );

      await expect(controller.createDelivery(dto)).rejects.toThrow(
        NotFoundException,
      );

      try {
        await controller.createDelivery(dto);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'TRANSACTION_NOT_FOUND',
            message: expect.any(String),
          },
        });
      }
    });

    it('should throw BadRequestException if transaction not approved', async () => {
      createDeliveryUseCase.execute.mockResolvedValue(
        failure(new DeliveryTransactionNotApprovedError('transaction_1')),
      );

      await expect(controller.createDelivery(dto)).rejects.toThrow(
        BadRequestException,
      );

      try {
        await controller.createDelivery(dto);
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'TRANSACTION_NOT_APPROVED',
            message: expect.any(String),
          },
        });
      }
    });

    it('should throw BadRequestException if delivery already exists', async () => {
      createDeliveryUseCase.execute.mockResolvedValue(
        failure(new DeliveryAlreadyExistsError('transaction_1')),
      );

      await expect(controller.createDelivery(dto)).rejects.toThrow(
        BadRequestException,
      );

      try {
        await controller.createDelivery(dto);
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response).toMatchObject({
          success: false,
          error: {
            type: 'DELIVERY_ALREADY_EXISTS',
            message: expect.any(String),
          },
        });
      }
    });

    it('should throw InternalServerErrorException on repository error', async () => {
      createDeliveryUseCase.execute.mockResolvedValue(
        failure(new RepositoryError('db error')),
      );

      await expect(controller.createDelivery(dto)).rejects.toThrow(
        InternalServerErrorException,
      );

      try {
        await controller.createDelivery(dto);
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
  });
});
