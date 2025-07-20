import {
  Controller,
  Get,
  Param,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CheckCustomerExistsUseCase } from '../../application/use-cases/check-customer-exists.use-case';
import { CheckCustomerErrorType } from '../../application/errors/check-customers-errors';
import { CheckCustomertExistsDto } from '../../application/dto/check-customer-exists.dto';

export interface CheckCustomerSuccessResponse {
  success: true;
  data: {
    exists: boolean;
    customer: {
      id: string;
      name: string;
      email: string;
      createdAt: string;
    } | null;
  };
}

export interface CheckCustomerErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    timestamp: string;
  };
}

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly checkCustomerExistsUseCase: CheckCustomerExistsUseCase,
  ) {}

  @Get('check/:email')
  @ApiOperation({
    summary: 'Check if customer exists by email',
    description:
      'Verifies if a customer exists in the system using their email address',
  })
  @ApiParam({
    name: 'email',
    description: 'Customer email address',
    example: 'juan@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer check completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            exists: { type: 'boolean', example: true },
            customer: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '123' },
                name: { type: 'string', example: 'Juan Pérez' },
                email: { type: 'string', example: 'juan@example.com' },
                createdAt: { type: 'string', example: '2024-01-01T00:00:00Z' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Business rule validation failed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          properties: {
            type: { type: 'string', example: 'BUSINESS_RULE_ERROR' },
            message: { type: 'string', example: 'Invalid email format' },
            timestamp: { type: 'string', example: '2024-01-01T00:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async checkCustomerExists(
    @Param() checkParam: CheckCustomertExistsDto,
  ): Promise<CheckCustomerSuccessResponse> {
    const { email } = checkParam;

    const result = await this.checkCustomerExistsUseCase.execute({ email });

    if (result.isFailure()) {
      this.handleError(result.error);
    }

    return {
      success: true,
      data: {
        exists: result.value.exists,
        customer: result.value.customer,
      },
    };
  }

  private handleError(error: CheckCustomerErrorType): never {
    const timestamp = new Date().toISOString();

    switch (error.type) {
      case 'BUSINESS_RULE_ERROR':
        throw new BadRequestException({
          success: false,
          error: {
            type: error.type,
            message: error.message,
            timestamp,
          },
        });

      case 'REPOSITORY_ERROR':
        throw new InternalServerErrorException({
          success: false,
          error: {
            type: 'INTERNAL_ERROR',
            message: 'An internal error occurred while processing your request',
            timestamp,
          },
        });

      case 'UNEXPECTED_ERROR':
        throw new InternalServerErrorException({
          success: false,
          error: {
            type: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
            timestamp,
          },
        });

      default:
        throw new InternalServerErrorException({
          success: false,
          error: {
            type: 'INTERNAL_ERROR',
            message: 'Unknown error type',
            timestamp,
          },
        });
    }
  }
}
