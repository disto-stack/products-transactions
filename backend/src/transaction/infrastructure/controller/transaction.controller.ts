import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateTransactionErrorType,
  CreateTransactionUseCase,
} from '../../application/use-cases/create-transaction.use-case';
import { CreateTransactionDto } from '../../application/dto/create-transaction.dto';
import { CreateTransactionResponseDto } from '../../application/dto/create-transaction-response.dto';
import {
  TransactionInsufficientStockError,
  TransactionProductNotFoundError,
} from '../../application/errors/transaction.errors';
import { RepositoryError } from '../../../shared/application/errors/application.errors';

interface TransactionSuccessResponse {
  success: boolean;
  data: {
    transaction: CreateTransactionResponseDto;
  };
}

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
  ) {}

  @Post()
  async createTransaction(
    @Body() createDto: CreateTransactionDto,
  ): Promise<TransactionSuccessResponse> {
    const result = await this.createTransactionUseCase.execute(createDto);

    if (result.isFailure()) {
      this.handleError(result.error);
    }

    return {
      success: true,
      data: {
        transaction: result.value,
      },
    };
  }

  private handleError(error: CreateTransactionErrorType): never {
    if (error instanceof TransactionProductNotFoundError) {
      throw new NotFoundException({
        success: false,
        error: {
          type: 'PRODUCT_NOT_FOUND',
          message: error.message,
        },
      });
    }

    if (error instanceof TransactionInsufficientStockError) {
      throw new BadRequestException({
        success: false,
        error: {
          type: 'INSUFFICIENT_STOCK',
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
