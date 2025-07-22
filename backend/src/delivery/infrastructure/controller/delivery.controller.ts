import {
  Controller,
  Post,
  Body,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CreateDeliveryErrorType,
  CreateDeliveryUseCase,
} from '../../application/use-cases/create-delivery.use-case';
import { CreateDeliveryDto } from '../../application/dto/create-delivery.dto';
import { CreateDeliveryResponseDto } from '../../application/dto/create-delivery-response.dto';
import {
  DeliveryTransactionNotFoundError,
  DeliveryTransactionNotApprovedError,
  DeliveryAlreadyExistsError,
} from '../../application/errors/delivery.errors';
import { RepositoryError } from '../../../shared/application/errors/application.errors';

interface DeliverySuccessResponse {
  success: boolean;
  data: {
    delivery: CreateDeliveryResponseDto;
  };
}

@Controller('deliveries')
export class DeliveryController {
  constructor(private readonly createDeliveryUseCase: CreateDeliveryUseCase) {}

  @Post()
  async createDelivery(
    @Body() dto: CreateDeliveryDto,
  ): Promise<DeliverySuccessResponse> {
    const result = await this.createDeliveryUseCase.execute(dto);

    if (result.isFailure()) {
      this.handleError(result.error);
    }

    return {
      success: true,
      data: { delivery: result.value },
    };
  }

  private handleError(error: CreateDeliveryErrorType): never {
    if (error instanceof DeliveryTransactionNotFoundError) {
      throw new NotFoundException({
        success: false,
        error: {
          type: 'TRANSACTION_NOT_FOUND',
          message: error.message,
        },
      });
    }

    if (error instanceof DeliveryTransactionNotApprovedError) {
      throw new BadRequestException({
        success: false,
        error: {
          type: 'TRANSACTION_NOT_APPROVED',
          message: error.message,
        },
      });
    }

    if (error instanceof DeliveryAlreadyExistsError) {
      throw new BadRequestException({
        success: false,
        error: {
          type: 'DELIVERY_ALREADY_EXISTS',
          message: error.message,
        },
      });
    }

    if (error instanceof RepositoryError) {
      throw new InternalServerErrorException({
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          message: 'An internal error occurred while processing your request',
        },
      });
    }

    throw new InternalServerErrorException({
      success: false,
      error: {
        type: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
}
