import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Patch,
  Param,
} from '@nestjs/common';
import {
  CreateTransactionErrorType,
  CreateTransactionUseCase,
} from '../../application/use-cases/create-transaction.use-case';
import { CreateTransactionDto } from '../../application/dto/create-transaction.dto';
import { CreateTransactionResponseDto } from '../../application/dto/create-transaction-response.dto';
import {
  TransactionAlreadyProcessedError,
  TransactionInsufficientStockError,
  TransactionNotFoundError,
  TransactionProductNotFoundError,
} from '../../application/errors/transaction.errors';
import { RepositoryError } from '../../../shared/application/errors/application.errors';
import { ChangeTransactionDto } from '../../application/dto/change-transaction-status.dto';
import { ApproveTransactionResponseDto } from '../../application/dto/approve-transaction-response.dto';
import {
  ApproveTransactionErrorType,
  ApproveTransactionUseCase,
} from '../../application/use-cases/approve-transaction.use-case';
import {
  DeclineTransactionErrorType,
  DeclineTransactionUseCase,
} from '../../application/use-cases/decline-transaction.use-case';
import { DeclineTransactionResponseDto } from '../../application/dto/decline-transaction-response.dto';

interface TransactionSuccessResponse {
  success: boolean;
  data: {
    transaction:
      | CreateTransactionResponseDto
      | ApproveTransactionResponseDto
      | DeclineTransactionResponseDto;
  };
}

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly approveTransactionUseCase: ApproveTransactionUseCase,
    private readonly declineTransactionUseCase: DeclineTransactionUseCase,
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

  @Patch(':id/approve')
  async approveTransaction(
    @Param() approveDto: ChangeTransactionDto,
  ): Promise<TransactionSuccessResponse> {
    const result = await this.approveTransactionUseCase.execute(approveDto);

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

  @Patch(':id/decline')
  async declineTransaction(
    @Param() declineDto: ChangeTransactionDto,
  ): Promise<TransactionSuccessResponse> {
    const result = await this.declineTransactionUseCase.execute(declineDto);

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

  private handleError(
    error:
      | CreateTransactionErrorType
      | ApproveTransactionErrorType
      | DeclineTransactionErrorType,
  ): never {
    if (error instanceof TransactionNotFoundError) {
      throw new NotFoundException({
        success: false,
        error: {
          type: 'TRANSACTION_NOT_FOUND',
          message: error.message,
        },
      });
    }

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

    if (error instanceof TransactionAlreadyProcessedError) {
      throw new BadRequestException({
        success: false,
        error: {
          type: 'ALREADY_PROCESSED',
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
